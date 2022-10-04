import { access, readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { parse } from 'yaml';

import { InvalidFileError, NotFoundError } from './errors/index.js';

export class AppConfig {
    /**
     * Carga el contenido de "./appconfig.yml" parseado y validado en una nueva instancia.
     */
    static async load(): Promise<AppConfig> {
        // Comprobar ruta actual
        const path = resolve('./appconfig.yml');
        try {
            await access(path);
        } catch {
            throw new NotFoundError();
        }

        try {
            // Leer y parsear archivo
            const text = await readFile(path, 'utf-8');
            const yaml = parse(text) as Pick<AppConfig, 'interval' | 'targets'>;
    
            // Validar contenido
            const valid = 
                typeof yaml.interval === 'number'               &&
                !isNaN(yaml.interval)                           &&
                yaml.targets instanceof Array                   &&
                !yaml.targets.some(x => typeof x !== 'string');
    
            if (!valid) {
                throw new Error();
            }
    
            // Retornar instancia
            return new AppConfig(
                Math.abs(Math.trunc(yaml.interval)),
                yaml.targets
            );
        } catch (err: any) {
            throw new InvalidFileError();
        }
    }

    /**
     * Crea un nuevo archivo con datos por defecto
     */
    static async create(): Promise<void> {
        const path = resolve('./appconfig.yml');
        const text =    '# Tiempo de espera en ms entre cada comprobación\n'
                    +   'interval: 5000\n\n'
                    +   '# Lista de carpetas que deben de ser montadas\n'
                    +   'targets:\n'
                    +   '   - "/ruta/de/ejemplo/01"\n'
                    +   '   - "/ruta/de/ejemplo/02"\n'
                    +   '   - "/ruta/de/ejemplo/03"\n';

        return writeFile(path, text);
    }

    readonly interval!: number;
    readonly targets!: string[];

    private constructor(interval: number, targets: string[]) {
        Object.defineProperties(this, {
            interval: { value: interval, configurable: false, writable: false },
            targets:  { value: targets,  configurable: false, writable: false }
        });
    }
}