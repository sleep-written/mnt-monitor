import type { Executable } from '@bleed-believer/commander';

import { styleText } from 'node:util';
import { Command } from '@bleed-believer/commander';

import { EntrypointMenuItem } from './entrypoint.menu-item.js';
import { dataSource } from 'data-source.ts';
import { banner } from 'banner.ts';
import { Menu } from 'lib/menu';

@Command({
    path: 'setup',
    name: 'Daemon Setup'
})
export class SetupCommand implements Executable {
    async start(): Promise<void> {
        await dataSource.initialize();
        
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