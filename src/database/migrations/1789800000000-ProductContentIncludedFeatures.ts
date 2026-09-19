import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductContentIncludedFeatures1789800000000 implements MigrationInterface {
    name = 'ProductContentIncludedFeatures1789800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_content" ADD "includedFeatures" jsonb NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_content" DROP COLUMN "includedFeatures"`);
    }
}
