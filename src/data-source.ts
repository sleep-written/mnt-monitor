import { mkdir, appendFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { homedir } from 'node:os';

const baseDir = process.getuid?.() !== 0 ? resolve(homedir(), '.local/share') : '/var/lib';
const database = resolve(baseDir, 'mechty-fstab/settings.db');

await mkdir(dirname(database), { recursive: true });
await appendFile(database, Buffer.alloc(0));

console.log('db location:', database);
export const dataSource = new DataSource({
    type: 'better-sqlite3',
    database,
    entities: [
        resolve(import.meta.dirname, './entities/*.{ts,js}')
    ],
    migrations: [
        resolve(import.meta.dirname, './migrations/*.{ts,js}')
    ]
});