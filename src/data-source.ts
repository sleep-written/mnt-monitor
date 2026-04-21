import { DataSource } from 'typeorm';
import { resolve } from 'node:path';

export const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: resolve(import.meta.dirname, '../settings.db'),
    entities: [
        resolve(import.meta.dirname, './entities/*.{ts,js}')
    ],
    migrations: [
        resolve(import.meta.dirname, './migrations/*.{ts,js}')
    ]
});