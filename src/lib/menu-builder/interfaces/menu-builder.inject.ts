import type { MenuBuilderController } from './menu-builder.controller.js';

export interface MenuBuilderInject {
    abortController?(): AbortController;

    process?: {
        on(name: 'SIGINT', callback: () => unknown): void;
        off(name: 'SIGINT', callback: () => unknown): void;

        stdin: {
            setRawMode(v: boolean): void;
            resume(): void;
            pause(): void;
            once(
                name: 'data',
                callback: () => unknown
            ): void;
        };
    };

    select?(
        config: {
            message: string;
            choices: {
                name: string;
                value: (ctrl: MenuBuilderController) => unknown;
                description?: string;
            }[];
        },
        options?: {
            signal?: AbortSignal;
            clearPromptOnDone?: boolean;
        }
    ): Promise<
        ((ctrl: MenuBuilderController) => unknown) |
        undefined
    >;
}