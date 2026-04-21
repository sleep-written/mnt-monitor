import type { MenuSettings, MenuContext, MenuItem } from './interfaces/index.js';

import { ExitPromptError, Separator } from '@inquirer/core';
import { select } from '@inquirer/prompts';

export class Menu {
    #settings: MenuSettings;

    get length(): number {
        return this.#settings.items.length;
    }

    constructor(settings: MenuSettings) {
        this.#settings = settings;
    }

    async execute(): Promise<void> {
        const context: MenuContext = {
            ctrl: new AbortController(),
            pause: (msg?: string) => new Promise<void>(resolve => {
                const isRaw = process.stdin.isRaw;
                console.log(msg ?? 'Press any key to continue...');

                process.stdin.resume();
                process.stdin.setRawMode(true);
                process.stdin.once('data', () => {
                    process.stdin.pause();
                    process.stdin.setRawMode(isRaw);
                    resolve();
                });
            })
        };

        let value: MenuItem | undefined;
        while (!context.ctrl.signal.aborted) {
            try {
                const choices = this.#settings.items.map(x => typeof x === 'string'
                    ?   new Separator(x)
                    :   {
                        name: x.title,
                        description: x.description,
                        value: x
                    }
                );

                console.clear();
                if (this.#settings.header) {
                    console.info(this.#settings.header);
                }

                const pageSize = this.#settings.pageSize;
                value = await select({
                    pageSize: typeof pageSize === 'string'
                    ?   this.length
                    :   pageSize,
                    message: this.#settings.message,
                    theme: this.#settings.theme,
                    loop: this.#settings.loop,

                    default: value,
                    choices
                });

                try {
                    await value.callback(context);
                } catch (err) {
                    console.error(err);
                    console.log(''.padEnd(28, '-'));
                    await context.pause();
                }
            } catch (err) {
                if (err instanceof ExitPromptError) {
                    break;
                } else {
                    console.error(err);
                }
            }
        }
    }
}