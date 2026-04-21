import { CommandRouting } from '@bleed-believer/commander';

import { SetupCommand } from './setup/command.js';

@CommandRouting({
    commands: [
        SetupCommand,
    ]
})
export class AppRouting {}