import type { MenuContext, MenuItem } from 'lib/menu';
import type { AsyncSpawnOptions } from 'lib/wrappers';

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { asyncSpawn } from 'lib/wrappers';
import { accessSync } from 'node:fs';
import { homedir } from 'node:os';

export class InstallMenuItem implements MenuItem {
    #installed: boolean;
    #opts: AsyncSpawnOptions = { throwsOnExitCode: true };
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

    get title(): string {
        const verb = this.#installed
        ?   'Uninstall'
        :   'Install';

        return `[🛠️] ${verb} service`;
    }

    get description(): string {
        return this.#installed
        ?   `Stops and removes the daemon from "systemd"`
        :   `Creates and initialize the daemon in "systemd"`
    }

    constructor() {
        try {
            accessSync(this.#servicePath);
            this.#installed = true;
        } catch {
            this.#installed = false;
        }
    }

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
        if (!this.#installed) {
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
        } else {
            await asyncSpawn(
                'systemctl', [ ...this.#serviceFlags, 'stop', 'mechty-fstab' ],
                this.#opts
            );

            await asyncSpawn(
                'systemctl', [ ...this.#serviceFlags, 'disable', 'mechty-fstab' ],
                this.#opts
            );

            await rm(this.#servicePath, { force: true });
            await asyncSpawn(
                'systemctl', [ ...this.#serviceFlags, 'daemon-reload' ],
                this.#opts
            );
        }

        this.#installed = !this.#installed;
    }
}