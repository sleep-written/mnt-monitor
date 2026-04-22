import { CommandRouting } from '@bleed-believer/commander';

import { SetupCommand } from './setup/command.js';
import { DaemonCommand } from './daemon/command.js';
import { MonitorCommand } from './monitor/command.js';

@CommandRouting({
    commands: [
        SetupCommand,
        DaemonCommand,
        MonitorCommand,
    ]
})
export class AppRouting {}