import type { Argv, Executable } from '@bleed-believer/commander';

import { Command, GetArgv } from '@bleed-believer/commander';
import { styleText } from 'node:util';
import { spawn } from 'node:child_process';

@Command({
    name: 'Mechty Monitor',
    path: 'monitor',
    info: [
        `Watch your mechty-fstab service on journalctl.\n`,
        `Available flags:`,
        [
            styleText('blueBright', '--lines') + ',',
            styleText('blueBright', '-l') + ':',
            'For specific amount of displayed lines.'
        ].join(' ')
        
    ].join('\n')
})
export class MonitorCommand implements Executable {
    @GetArgv()
    declare argv: Argv;

    async start(): Promise<void> {
        const params = [ '-u', 'mechty-fstab', '-f' ];
        if (process.getuid?.() !== 0) {
            params.unshift('--user');
        }

        const lines = this.argv.flags['--lines'] ?? this.argv.flags['--l'];
        if (typeof lines?.[0] === 'string') {
            params.push('-n', lines[0]);
        }

        let rejected = false;
        return new Promise<void>((resolve, reject) => {
            const slave = spawn('journalctl', params, {
                stdio: 'inherit'
            });

            process.once('SIGINT', () => {
                slave.kill('SIGINT');
            });

            slave.on('exit', () => {
                !rejected &&
                resolve();
            });

            slave.on('error', err => {
                rejected = true;
                reject(err);
            });
        });
    }
}