import type { FileSystemObject, FileSystemInject } from './interfaces/index.js';

import { fileSystemload } from './file-system-load.js';
import { asyncSpawn } from './async-spawn.js';

export class FileSystem implements FileSystemObject {
    static async load(predicate?: (o: FileSystem, i: number) => boolean): Promise<FileSystem[]> {
        const data = await fileSystemload();
        const resp = data.map(x => new FileSystem(x));
        return predicate
        ?   resp.filter(predicate)
        :   resp;
    }

    static async find(predicate: (o: FileSystem, i: number) => boolean): Promise<FileSystem | undefined> {
        const data = await fileSystemload();
        return data
            .map(x => new FileSystem(x))
            .find(predicate);
    }

    #inject: Required<FileSystemInject>;

    #fstype: string;
    get fstype(): string {
        return this.#fstype;
    }

    #target: string;
    get target(): string {
        return this.#target;
    }

    #source: string;
    get source(): string {
        return this.#source;
    }

    #options: string;
    get options(): string {
        return this.#options;
    }

    constructor(data: FileSystemObject, inject?: FileSystemInject) {
        this.#fstype = data.fstype;
        this.#target = data.target;
        this.#source = data.source;
        this.#options = data.options;
        this.#inject = {
            asyncSpawn: inject?.asyncSpawn?.bind(inject)    ?? asyncSpawn
        };
    }

    valueOf(): FileSystemObject {
        return {
            fstype: this.#fstype,
            target: this.#target,
            source: this.#source,
            options: this.#options
        };
    }

    async mount(): Promise<void> {
        const { code, stdout, stderr } = await this.#inject.asyncSpawn(
            'mount', [ this.#target ]
        );

        if (code !== 0) {
            throw new Error(stderr ?? stdout ?? `Unknown error`);
        }
    }

    async unmount(): Promise<void> {
        const { code, stdout, stderr } = await this.#inject.asyncSpawn(
            'umount', [ this.#target ]
        );

        if (code !== 0) {
            throw new Error(stderr ?? stdout ?? `Unknown error`);
        }
    }

    async isMounted(): Promise<boolean> {
        const { code, stdout, stderr } = await this.#inject.asyncSpawn(
            'findmnt', [ this.#target, '--json' ]
        );

        switch (code) {
            case 0: {
                return true;
            }

            case 1: {
                return false;
            }

            default: {
                throw new Error(stderr ?? stdout ?? `Unknown error`);
            }
        }
    }
}