import type { Executable } from '@bleed-believer/commander';

import { styleText } from 'node:util';
import { Command } from '@bleed-believer/commander';

import { EntrypointMenuItem } from './entrypoint.menu-item.js';
import { dataSource } from 'data-source.ts';
import { banner } from 'banner.ts';
import { Menu } from 'lib/menu';

@Command({
    path: 'setup',
    name: 'Mechty Setup',
    info: [
        'Setups the daemon behavior. For example, you can select which',
        'filesystem target the daemon must watch.'
    ].join('\n')
})
export class SetupCommand implements Executable {
    async start(): Promise<void> {
        console.clear();
        console.log(banner);
        console.log('Initializing database...');
        await dataSource.initialize();
        await dataSource.runMigrations();
        
        await new Menu({
            pageSize: 'auto',
            message: 'Available entrypoints:',
            header: banner,
            items: [
                ...await EntrypointMenuItem.load(),
                '',
                [
                    styleText('blue', '?'),
                    styleText('whiteBright', 'Another options:')
                ].join(' '),
                {
                    title: '[💀] Exit',
                    description: 'Closes the current daemon setup',
                    callback: c => c.ctrl.abort()
                }
            ],
        }).execute();

        await dataSource.destroy();
    }
}