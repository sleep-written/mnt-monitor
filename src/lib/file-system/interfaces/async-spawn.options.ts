import type { SpawnOptionsWithoutStdio } from 'node:child_process';

export interface AsyncSpawnOptions extends SpawnOptionsWithoutStdio {
    encoding?: BufferEncoding;
}