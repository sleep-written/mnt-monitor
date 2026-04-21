import type { MenuContext } from './menu.context.js';

export interface MenuItem {
    readonly title: string;
    readonly description?: string;
    callback(context: MenuContext): void | Promise<void>;
}