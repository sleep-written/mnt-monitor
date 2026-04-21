import type { MenuItem } from './menu.item.js';
import type { Theme } from '@inquirer/core';

export interface MenuSettings {
    pageSize?: number | 'auto';
    header?: string;
    theme?: Theme;
    loop?: boolean;

    message: string;
    items: (MenuItem | string)[];
}