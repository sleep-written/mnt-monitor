import type { MenuItem } from 'lib/menu';

import { FileSystem } from 'lib/file-system';
import { Entrypoint } from 'entities/entrypoint.ts';
import { dataSource } from 'data-source.ts';
import { styleText } from 'node:util';

export class EntrypointMenuItem implements MenuItem {
    static async load(): Promise<MenuItem[]> {
        const fileSystems = await FileSystem.load(x => x.target !== 'none');
        const entrypoints = await Entrypoint.find();

        for (const entrypoint of entrypoints) {
            if (!fileSystems.some(x => x.target === entrypoint.target)) {
                await entrypoint.remove();
            }
        }

        return fileSystems.map(fileSystem => new EntrypointMenuItem(
            fileSystem,
            entrypoints.some(x => x.target === fileSystem.target)
        ));
    }

    #watch: boolean;
    #fileSystem: FileSystem;

    get title(): string {
        const checkbox = this.#watch
        ?   `[⭕]`
        :   `[➖]`;

        const name = styleText(
            'greenBright',
            `"${this.#fileSystem.target}"`
        );

        return `${checkbox} ${name}`;
    }

    get description(): string {
        const verb = this.#watch ? 'Removes' : 'Inserts';
        return `${verb} the current entrypoint from watchlist`;
    }

    constructor(fileSystem: FileSystem, watch: boolean) {
        this.#watch = watch;
        this.#fileSystem = fileSystem;
    }

    async callback(): Promise<void> {
        await dataSource.transaction('SERIALIZABLE', async m => {
            const target = this.#fileSystem.target;
            const entrypoint = await m.findOneBy(Entrypoint, { target }) ?? new Entrypoint();
            if (typeof entrypoint.id === 'number') {
                await entrypoint.remove();
                this.#watch = false;
            } else {
                entrypoint.target = target;
                await entrypoint.save();
                this.#watch = true;
            }
        });
    }
}