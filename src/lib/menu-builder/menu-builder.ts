import type { MenuBuilderConfig, MenuBuilderController, MenuBuilderInject } from './interfaces/index.js';

import { ExitPromptError } from '@inquirer/core';
import { select } from '@inquirer/prompts';

export class MenuBuilder<C extends MenuBuilderConfig> {
    #injected: Required<MenuBuilderInject>;
    #config: C;

    constructor(config: C, inject?: MenuBuilderInject) {
        this.#config = config;
        this.#injected = {
            abortController:    inject?.abortController ?? (() => new AbortController),
            process:            inject?.process         ?? process,
            select:             inject?.select          ?? select,
        };
    }

    async #pause(msg?: string): Promise<void> {
        console.log(msg ?? 'Press any key to continue...');

        this.#injected.process.stdin.resume();
        this.#injected.process.stdin.setRawMode(true);
        this.#injected.process.stdin.once('data', () => {
            loop = false;
            this.#injected.process.stdin.setRawMode(false);
            this.#injected.process.stdin.pause();
        });

        let loop = true;
        while (loop) {
            await new Promise(r => setTimeout(r, 250));
        }
    }

    async execute(): Promise<void> {
        const controller = this.#injected.abortController();
        const sigintCallback = () => {
            if (!controller.signal.aborted) {
                controller.abort();
            }
        };

        process.on('SIGINT', sigintCallback);

        while (!controller.signal.aborted) {
            console.clear();
            if (typeof this.#config.header === 'string') {
                console.info(this.#config.header);
            }

            const callback = await this.#injected.select(
                {
                    message: this.#config.message,
                    choices: this.#config.choices.map(x => ({
                        name: x.name,
                        value: x.callback,
                        description: x.info
                    }))
                },
                {
                    signal: controller.signal,
                    clearPromptOnDone: false
                }
            )
                .catch(err => {
                    if (err instanceof ExitPromptError) {
                        controller.abort();
                        return undefined;
                    }

                    throw err;
                });

            try {
                const ctrl: MenuBuilderController = {
                    abort: () => controller.abort(),
                    pause: msg => this.#pause(msg)
                };

                await callback?.(ctrl);


            } catch (err) {
                console.error(err);
            }
        }

        process.off('SIGINT', sigintCallback);
    }
}