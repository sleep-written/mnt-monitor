import type { MechtyInject } from './mechty.inject.js';

import { Mechty } from './mechty.js';
import { test } from 'node:test';

class Redbull implements MechtyInject {
    #timestamps: number[];
    get timestamps(): number[] {
        return this.#timestamps.slice();
    }

    #timeouts: number[];
    get timeouts(): number[] {
        return this.#timeouts.slice();
    }

    constructor(timestamps: number[]) {
        this.#timestamps = timestamps;
        this.#timeouts = [];
    }

    dateConstructor = {
        now: () => {
            const timestamp = this.#timestamps.shift();
            if (typeof timestamp !== 'number') {
                throw new Error(`The universe is dead`);
            }

            return timestamp;
        }
    };

    setTimeout(callback: () => unknown, ms: number): void {
        this.#timeouts.push(ms);
        callback();
    }
}

test(`new Mechty(1_000); execute took 400 ms`, async (t: test.TestContext) => {
    const redbull = new Redbull([
        1_000,
        1_400
    ]);

    const mechty = new Mechty(1_000, redbull);
    await mechty.execute(() => {});

    t.assert.deepStrictEqual(redbull.timeouts, [ 600 ]);
});

test(`new Mechty(1_000); execute took 1_500 ms`, async (t: test.TestContext) => {
    const redbull = new Redbull([
        1_000,
        2_500
    ]);

    const mechty = new Mechty(1_000, redbull);
    await mechty.execute(() => {});

    t.assert.deepStrictEqual(redbull.timeouts, [ ]);
});