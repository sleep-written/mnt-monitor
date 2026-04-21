import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDb1776774927541 implements MigrationInterface {
    name = 'CreateDb1776774927541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Entrypoint" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "target" varchar NOT NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Entrypoint"`);
    }

}
