import type { AsyncSpawnOptions } from './async-spawn.options.js';
import type { AsyncSpawnOutput } from './async-spawn.output.js';

export interface FileSystemInject {
    asyncSpawn?(cmd: string, args?: string[], opts?: AsyncSpawnOptions): Promise<AsyncSpawnOutput>;
}