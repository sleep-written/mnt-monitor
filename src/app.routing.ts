import { CommandRouting } from '@bleed-believer/commander';

import { SetupCommand } from './setup/command.js';
import { DaemonCommand } from './daemon/command.js';

@CommandRouting({
    commands: [
        SetupCommand,
        DaemonCommand,
    ]
})
export class AppRouting {}