import { MigrationInterface, QueryRunner } from "typeorm";

export class DropContactMessage1789810000000 implements MigrationInterface {
    name = 'DropContactMessage1789810000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "contact_message"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."contact_message_status_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."contact_message_status_enum" AS ENUM('New', 'Read', 'Archived')`);
        await queryRunner.query(`CREATE TABLE "contact_message" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(120) NOT NULL, "email" character varying(180) NOT NULL, "subject" character varying(200) NOT NULL, "message" text NOT NULL, "status" "public"."contact_message_status_enum" NOT NULL DEFAULT 'New', CONSTRAINT "PK_58247ecdb7e165d0f094cb5eaa6" PRIMARY KEY ("_id"))`);
    }
}
