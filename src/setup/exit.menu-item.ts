import type { MenuContext, MenuItem } from 'lib/menu';

export class ExitMenuItem implements MenuItem {
    readonly title = `[💀] Exit`;
    readonly description = 'Closes the current daemon setup';

    callback(context: MenuContext): void {
        context.ctrl.abort();
    }
}