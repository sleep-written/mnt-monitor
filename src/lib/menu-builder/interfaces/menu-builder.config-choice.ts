import type { MenuBuilderController } from './menu-builder.controller.js';

export interface MenuBuilderConfigChoice {
    name: string;
    info?: string;
    callback: (ctrl: MenuBuilderController) => unknown;
}