import type { AsyncSpawnOptions, AsyncSpawnOutput, FileSystemInject, FileSystemObject } from './interfaces/index.js';

import { FileSystem } from './file-system.js';
import { test } from 'node:test';

class Inject implements FileSystemInject {
    #mounted: boolean;

    constructor(mounted: boolean) {
        this.#mounted = mounted;
    }

    async asyncSpawn(cmd: string, _?: string[], __?: AsyncSpawnOptions): Promise<AsyncSpawnOutput> {
        switch (cmd) {
            case 'umount': {
                if (!this.#mounted) {
                    return {
                        code: 666,
                        stderr: 'The mountpoint is not mounted'
                    };
                } else {
                    this.#mounted = false;
                    return { code: 0 };
                }
            }

            case 'mount': {
                if (this.#mounted) {
                    return {
                        code: 666,
                        stderr: 'The mountpoint is already mounted'
                    };
                } else {
                    this.#mounted = true;
                    return { code: 0 };
                }
            }

            case 'findmnt': {
                return { code: this.#mounted ? 0 : 1 };
            }

            default: {
                return {
                    code: 666,
                    stderr: 'Command not found'
                };
            }
        }
    }
};

const mountpoint: FileSystemObject = {
    fstype: 'ext4',
    target: '/',
    source: 'Leon el 9/11: "No debí viajar en económico"',
    options: 'defauls'
};

test('Created a mounted instance', async (t: test.TestContext) => {
    const fileSystem = new FileSystem(mountpoint, new Inject(true));
    const mounted = await fileSystem.isMounted();
    t.assert.strictEqual(mounted, true);
});

test('Created a mounted instance and unmount', async (t: test.TestContext) => {
    const fileSystem = new FileSystem(mountpoint, new Inject(true));
    await fileSystem.unmount();

    const mounted = await fileSystem.isMounted();
    t.assert.strictEqual(mounted, false);
});

test('Created a not mounted instance', async (t: test.TestContext) => {
    const fileSystem = new FileSystem(mountpoint, new Inject(false));
    const mounted = await fileSystem.isMounted();
    t.assert.strictEqual(mounted, false);
});

test('Created a not mounted instance and mount', async (t: test.TestContext) => {
    const fileSystem = new FileSystem(mountpoint, new Inject(false));
    await fileSystem.mount();

    const mounted = await fileSystem.isMounted();
    t.assert.strictEqual(mounted, true);
});