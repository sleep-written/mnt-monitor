import type { Executable } from '@bleed-believer/commander';

import { select, Separator } from '@inquirer/prompts';
import { ExitPromptError } from '@inquirer/core';
import { styleText } from 'node:util';
import { Command } from '@bleed-believer/commander';

import { Entrypoint } from 'entities/entrypoint.ts';
import { FileSystem } from 'lib/file-system';
import { dataSource } from 'data-source.ts';
import { banner } from 'banner.ts';

interface MenuItem {
    name: string;
    value: {
        target?: string;
        callback: () => unknown;
    };
    description: string;
}

@Command({
    path: 'setup',
    name: 'Daemon Setup'
})
export class SetupCommand implements Executable {
    async #buildMenu(ctrl: AbortController): Promise<(MenuItem | Separator)[]> {
        const entrypoints = await Entrypoint.find();
        const fileSystems = await FileSystem.load(x => x.target !== 'none');
        const menuItems = fileSystems.map(fileSystem => {
            const entrypoint = entrypoints.find(x => x.target === fileSystem.target);
            const checkbox = entrypoint ? `[x]` : '[ ]';
            const filename = styleText('greenBright', `"${fileSystem.target}"`);
            const description = entrypoint
            ?   'Disable selected entrypoint'
            :   'Enable selected entrypoint';

            return {
                name: `${checkbox} ${filename}`,
                description,
                value: {
                    target: fileSystem.target,
                    async callback() {
                        if (entrypoint) {
                            await entrypoint.remove();
                        } else {
                            const item = new Entrypoint();
                            item.target = fileSystem.target;
                            await item.save();
                        }
                    }
                }
            } as MenuItem;
        });

        return [
            ...menuItems,
            new Separator('\n'),
            {
                name: 'Exit',
                description: 'Closes the program setup',
                value: {
                    callback: () => ctrl.abort()
                }
            }
        ];
    }

    async start(): Promise<void> {
        await dataSource.initialize();
        const controller = new AbortController();

        try {
            let target: string | undefined;
            while (!controller.signal.aborted) {
                console.clear();
                console.info(banner);

                const choices = await this.#buildMenu(controller);
                const defaultValue = target
                ?   (choices as MenuItem[])
                        .map(x => x?.value)
                        .find(x => x?.target === target)
                :   undefined;

                const value = await select({
                    loop: false,
                    default: defaultValue,
                    pageSize: 20,
                    message: 'Entrypoints to watch:',
                    choices
                }, { clearPromptOnDone: false });

                target = value.target;
                await value.callback?.();
            }
        } catch (err) {
            if (err instanceof ExitPromptError) {
                controller.abort();
            } else {
                console.error(err);
            }
        }

        await dataSource.destroy();
    }
}