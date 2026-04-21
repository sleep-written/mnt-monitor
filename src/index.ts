import { Commander, CommandNotFoundError } from '@bleed-believer/commander';
import { styleText } from 'node:util';

import { AppRouting } from 'app.routing.ts';
import { banner } from 'banner.ts';

const app = new Commander(AppRouting, { lowercase: true });

try {
    await app.execute();
} catch (err) {
    if (err instanceof CommandNotFoundError) {
        console.log(banner);
        console.log(styleText([ 'whiteBright' ], 'AVAILABLE COMMANDS:'));
        console.log(styleText([ 'gray' ], ''.padStart(64, '-')));

        app.docs().forEach(x => {
            const commandName = styleText(
                [ 'whiteBright', 'underline' ],
                x.name
            );

            const commandPath = styleText(
                [ 'blueBright' ],
                x.path.join(' ')
            );

            console.info(`${commandName}:\t→ ${commandPath}`);
            console.info(x.info);
            console.info();
        });

    } else {
        console.error(err);
    }
}