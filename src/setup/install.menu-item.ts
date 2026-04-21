import type { MenuContext, MenuItem } from 'lib/menu';
import type { AsyncSpawnOptions } from 'lib/wrappers';

import { dirname, resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { asyncSpawn } from 'lib/wrappers';
import { homedir } from 'node:os';

export class InstallMenuItem implements MenuItem {
    readonly title = `[🛠️] Install service`;
    readonly description = 'Install as "system.d" service';

    #cwd = resolve(import.meta.dirname, `../..`);

    #serviceFlags = process.getuid?.() !== 0
    ?   [ '--user' ]
    :   [];

    #serviceWantedBy = process.getuid?.() !== 0
    ?   'default.target'
    :   'multi-user.target';

    #servicePath = process.getuid?.() !== 0
    ?   resolve(homedir(), '.config/systemd/user/mechty-fstab.service')
    :   '/etc/systemd/system/mechty-fstab.service';

    #opts: AsyncSpawnOptions = {
        throwsOnExitCode: true
    };

    #buildFile(): string {
        const exec = [ process.execPath ];
        if (/\.(?:m|c)?tsx?$/i.test(import.meta.url)) {
            exec.push('--import');
            exec.push('@bleed-believer/cli');
            exec.push('./src/index.ts');
        } else {
            exec.push('./dist/index.js');
        }

        return [
            `[Unit]`,
            `Description=Mechty fstab watchdog`,
            `After=network-online.target`,
            `Wants=network-online.target`,
            ``,
            `[Service]`,
            `Type=simple`,
            `WorkingDirectory=${this.#cwd}`,
            `ExecStart=${exec.join(' ')} daemon`,
            `Restart=on-failure`,
            `RestartSec=5s`,
            ``,
            `[Install]`,
            `WantedBy=${this.#serviceWantedBy}`,
        ].join('\n');
    }

    async callback(_: MenuContext): Promise<void> {
        await mkdir(dirname(this.#servicePath), { recursive: true });
        const data = this.#buildFile();
        await writeFile(this.#servicePath, data);

        await asyncSpawn(
            'systemctl', [ ...this.#serviceFlags, 'daemon-reload' ],
            this.#opts
        );

        await asyncSpawn(
            'systemctl', [ ...this.#serviceFlags, 'enable', '--now', 'mechty-fstab' ],
            this.#opts
        );
    }
}