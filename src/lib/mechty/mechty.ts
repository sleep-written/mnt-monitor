import type { MechtyInject } from './mechty.inject.js';

export class Mechty {
    #injected: Required<MechtyInject>;
    #ms: number;

    constructor(ms: number, inject?: MechtyInject) {
        this.#ms = ms;
        this.#injected = {
            dateConstructor:    inject?.dateConstructor             ?? Date,
            setTimeout:         inject?.setTimeout?.bind(inject)    ?? setTimeout
        };
    }

    async execute(callback: () => unknown): Promise<void> {
        const timestamp = this.#injected.dateConstructor.now();

        try {
            await callback();

        } catch (err) {
            console.error(err);

        } finally {
            const diff = this.#injected.dateConstructor.now() - timestamp;
            if (diff < this.#ms) {
                const ms = this.#ms - diff;
                await new Promise<void>(r => this.#injected.setTimeout(r, ms));
            }
        }
    }
}