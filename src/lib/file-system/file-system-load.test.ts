import type { FileSystemInject } from './interfaces/index.js';

import { fileSystemload } from './file-system-load.js';
import { test } from 'node:test';

test('Sucessful load', async (t: test.TestContext) => {
    const inject: FileSystemInject = {
        asyncSpawn: async () => ({
            code: 0,
            stdout: JSON.stringify({
                filesystems: [
                    {
                        fstype: 'ext4',
                        target: '/',
                        source: 'Leon el 9/11: "No debí viajar en económico"',
                        options: 'defauls'
                    },
                    {
                        fstype: 'cifs',
                        target: '/mnt/innova',
                        source: 'Por favor deja de cagarme la vidaaaaaa',
                        options: 'vers=1.0,noperm'
                    }
                ]
            })
        })
    };

    const result = await fileSystemload(inject);
    t.assert.deepStrictEqual(result, [
        {
            fstype: 'ext4',
            target: '/',
            source: 'Leon el 9/11: "No debí viajar en económico"',
            options: 'defauls'
        },
        {
            fstype: 'cifs',
            target: '/mnt/innova',
            source: 'Por favor deja de cagarme la vidaaaaaa',
            options: 'vers=1.0,noperm'
        }
    ]);
});

test('Error: Command not found', async (t: test.TestContext) => {
    const inject: FileSystemInject = {
        asyncSpawn: async () => ({
            code: 666,
            stderr: 'Command not found'
        })
    };

    try {
        await fileSystemload(inject);
        t.assert.fail('An command error is expected');
    } catch (err: any) {
        t.assert.strictEqual(
            err?.message,
            'Command not found'
        );
    }
});

test('Error: Invalid JSON response', async (t: test.TestContext) => {
    const inject: FileSystemInject = {
        asyncSpawn: async () => ({
            code: 0,
            stdout: 'Flying Microtonal Banana'
        })
    };

    try {
        await fileSystemload(inject);
        t.assert.fail('An command error is expected');
    } catch (err: any) {
        t.assert.strictEqual(
            err?.message,
            'The command response must be a valid JSON object'
        );
    }
});

test('Error: Invalid "filesystems" type value', async (t: test.TestContext) => {
    const inject: FileSystemInject = {
        asyncSpawn: async () => ({
            code: 0,
            stdout: JSON.stringify({ filesystems: 666 })
        })
    };

    try {
        await fileSystemload(inject);
        t.assert.fail('An command error is expected');
    } catch (err: any) {
        t.assert.strictEqual(
            err?.message,
            'The command response doesn\'t contains a "filesystems" array'
        );
    }
});

test('Error: Invalid filesystems[1]["fstype"] type value', async (t: test.TestContext) => {
    const inject: FileSystemInject = {
        asyncSpawn: async () => ({
            code: 0,
            stdout: JSON.stringify({
                filesystems: [
                    {
                        fstype: 'ext4',
                        target: '/',
                        source: 'Leon el 9/11: "No debí viajar en económico"',
                        options: 'defauls'
                    },
                    {
                        fstype: 666,
                        target: '/mnt/innova',
                        source: 'Por favor deja de cagarme la vidaaaaaa',
                        options: 'vers=1.0,noperm'
                    }
                ]
            })
        })
    };

    try {
        await fileSystemload(inject);
        t.assert.fail('An command error is expected');
    } catch (err: any) {
        t.assert.strictEqual(
            err?.message,
            `The filesystems[1]["fstype"] must be an string type`
        );
    }
});