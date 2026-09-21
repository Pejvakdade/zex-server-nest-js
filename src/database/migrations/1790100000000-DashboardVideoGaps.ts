import { MigrationInterface, QueryRunner } from "typeorm";

/** Product-page hero image + SEO copy, and the product line on invoices (admin console parity, phase 9). */
export class DashboardVideoGaps1790100000000 implements MigrationInterface {
    name = 'DashboardVideoGaps1790100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_content" ADD "heroImage" character varying(300) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "product_content" ADD "seoTitle" character varying(120) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "product_content" ADD "seoDescription" character varying(300) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "product" character varying(80)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "product"`);
        await queryRunner.query(`ALTER TABLE "product_content" DROP COLUMN "seoDescription"`);
        await queryRunner.query(`ALTER TABLE "product_content" DROP COLUMN "seoTitle"`);
        await queryRunner.query(`ALTER TABLE "product_content" DROP COLUMN "heroImage"`);
    }
}
