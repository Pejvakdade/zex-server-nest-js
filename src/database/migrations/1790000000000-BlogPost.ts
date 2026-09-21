import { MigrationInterface, QueryRunner } from "typeorm";

export class BlogPost1790000000000 implements MigrationInterface {
    name = 'BlogPost1790000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."blog_post_status_enum" AS ENUM('Draft', 'Published')`);
        await queryRunner.query(`CREATE TABLE "blog_post" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying(200) NOT NULL, "slug" character varying(220) NOT NULL, "excerpt" character varying(400) NOT NULL DEFAULT '', "body" text NOT NULL DEFAULT '', "coverImage" character varying(300), "tags" text array NOT NULL DEFAULT '{}', "status" "public"."blog_post_status_enum" NOT NULL DEFAULT 'Draft', "featured" boolean NOT NULL DEFAULT false, "publishedAt" TIMESTAMP WITH TIME ZONE, "readingMinutes" integer NOT NULL DEFAULT '1', "authorId" uuid, CONSTRAINT "PK_blog_post__id" PRIMARY KEY ("_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_blog_post_slug" ON "blog_post" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_blog_post_status" ON "blog_post" ("status") `);
        await queryRunner.query(`ALTER TABLE "blog_post" ADD CONSTRAINT "FK_blog_post_author" FOREIGN KEY ("authorId") REFERENCES "user"("_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog_post" DROP CONSTRAINT "FK_blog_post_author"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_blog_post_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_blog_post_slug"`);
        await queryRunner.query(`DROP TABLE "blog_post"`);
        await queryRunner.query(`DROP TYPE "public"."blog_post_status_enum"`);
    }
}
