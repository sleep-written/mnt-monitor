import type { Executable } from '@bleed-believer/commander';

import { styleText } from 'node:util';
import { Command } from '@bleed-believer/commander';

import { Entrypoint } from 'entities/entrypoint.ts';
import { FileSystem } from 'lib/file-system';
import { dataSource } from 'data-source.ts';
import { Mechty } from 'lib/mechty';
import { banner } from 'banner.ts';

@Command({
    name: 'Mechty Daemon',
    path: 'daemon',
    info: [
        'Executes a thread that watch the mount state of every fileSystem',
        'declared in your fstab file.'
    ].join('\n')
})
export class DaemonCommand implements Executable {
    #separator = styleText('gray', ''.padStart(64, '-'));

    async #eventLoop(): Promise<void> {
        const entrypoints = await Entrypoint.find();
        const fileSystems = await FileSystem.load(({ target }) => {
            return entrypoints.some(x => x.target === target);
        });

        for (const fileSystem of fileSystems) {
            try {
                if (!await fileSystem.isMounted()) {
                    const target = styleText('greenBright', `"${fileSystem.target}"`);
                    console.warn(`FileSystem ${target}: Reconnecting...`);

                    await fileSystem.mount();
                    console.info(`FileSystem ${target}: Mounted!`);
                    console.log(this.#separator);
                }
            } catch (err) {
                console.error(err);
                console.log(this.#separator);
            }
        }
    }

    async start(): Promise<void> {
        console.log(banner);

        const controller = new AbortController();
        const controllerCallback = () => {
            if (!controller.signal.aborted) {
                controller.abort();
            }
        };

        console.log('Initializing database...');
        await dataSource.initialize();

        console.log('Mechty is watching your fstab!');
        console.log(this.#separator);

        const mechty = new Mechty(1_000);
        process.on('SIGINT', controllerCallback);
        while (!controller.signal.aborted) {
            await mechty.execute(async () => {
                try {
                    await this.#eventLoop();
                } catch (err) {
                    console.error(err);
                }
            });
        }

        process.off('SIGINT', controllerCallback);
        await dataSource.destroy();
        process.exit(0);
    }
}