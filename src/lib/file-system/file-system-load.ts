import type { FileSystemInject, FileSystemObject } from './interfaces/index.js';

import { asyncSpawn } from './async-spawn.js';

export async function fileSystemload(inject?: FileSystemInject): Promise<FileSystemObject[]> {
    const injected: Required<FileSystemInject> = {
        asyncSpawn: inject?.asyncSpawn  ?? asyncSpawn
    };

    const { code, stdout, stderr } = await injected.asyncSpawn(
        'findmnt',
        [ '--fstab', '--json' ]
    );

    if (code !== 0) {
        throw new Error(stderr ?? 'Unknown error');
    }

    let json: any;
    try {
        json = JSON
            .parse(stdout ?? `{ "filesystems": [] }`)
            ?.filesystems;
    } catch (err) {
        throw new Error('The command response must be a valid JSON object');
    }

    if (!Array.isArray(json)) {
        throw new Error('The command response doesn\'t contains a "filesystems" array');
    }

    const keys = [
        'fstype',
        'target',
        'source',
        'options'
    ] as const;

    return json.map((x, i) => {
        keys.forEach(k => {
            if (typeof x[k] !== 'string') {
                throw new Error(`The filesystems[${i}]["${k}"] must be an string type`);
            }
        });

        return {
            fstype: x.fstype,
            target: x.target,
            source: x.source,
            options: x.options
        };
    });
}