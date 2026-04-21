import { Commander } from '@bleed-believer/commander';
import { AppRouting } from 'app.routing.ts';

const app = new Commander(AppRouting, { lowercase: true });
await app.execute();