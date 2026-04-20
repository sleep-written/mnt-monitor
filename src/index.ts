import { styleText } from 'node:util';

import { FileSystem } from 'lib/file-system';
import { Mechty } from 'lib/mechty';
import { banner } from 'banner.js';

const controller = new AbortController();
const signal = controller.signal;
process.on('SIGINT', () => {
    if (!signal.aborted) {
        controller.abort();
    }
});

if (!process.stdout.isTTY) {
    console.info(banner);
    console.info(`Watching filesystem...`);
}

const mechty = new Mechty(1_000);
while (!signal.aborted) {
    await mechty.execute(async () => {
        try {
            if (process.stdout.isTTY) {
                console.clear();
                console.info(banner);
                console.info(`Watching filesystem...`);
            }

            const items = await FileSystem.load(x => x.target !== 'none');
            for (const item of items) {
                try {
                    if (await item.isMounted()) {
                        continue;
                    }

                    const name = styleText('greenBright', `"${item.target}"`);
                    console.warn(`Target ${name}: Not mounted, mounting...`);

                    await item.mount();
                    console.info(`Target ${name}: Ready!`);
                } catch (err) {
                    console.error(err);
                }
            }
        } catch (err) {
            console.error(err);
        }
    });
}