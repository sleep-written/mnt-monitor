import type { MenuBuilderConfigChoice } from './menu-builder.config-choice.js';

export interface MenuBuilderConfig {
    header?: string;
    message: string;
    choices: MenuBuilderConfigChoice[];
}