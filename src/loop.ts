import { Resource } from '@bleed-believer/mnt';
import { resolve } from 'path';

import { AppConfig } from './appcofig/index.js';
import { ShellLine } from './shell-line.js';

export class Loop {

    constructor() {
    }

    async execute(): Promise<void> {
        while (true) {
            const conf = await AppConfig.load();
            await this.#loop(conf);
        }
    }

    #sleep(ms: number): Promise<void> {
        return new Promise(r => setTimeout(r, ms));
    }

    async #loop(conf: AppConfig): Promise<void> {
        // Chequear puntos de montaje
        let pending = false;
        for (const target of conf.targets.map(x => resolve(x))) {
            const found = await Resource.some(x => resolve(x.target) === target);

            if (!found) {
                pending = true;
                const line = new ShellLine(`- [PEND] "${target}" no encontrado, montando...`);
                
                try {
                    // Intentar montar carpeta
                    await Resource.mount(target, true);
                    line.replace(`- [ OK ] "${target}" ha sido montado correctamente!`);
                } catch (err: any) {
                    line.replace(`- [FAIL]`, err?.message);
                }
            }
        }

        if (!pending) {
            console.log('- Todas las carpetas están montadas correctamente.');
        }

        console.log('');
        console.log(`- Siguiente ciclo en ${conf.interval} ms...`);
        await this.#sleep(conf.interval);
    }
}