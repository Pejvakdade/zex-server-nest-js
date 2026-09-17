import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1789474547277 implements MigrationInterface {
    name = 'Init1789474547277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "location" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "city" character varying(80) NOT NULL, "country" character varying(80) NOT NULL, "flag" character varying(16) NOT NULL, "datacenter" character varying(120) NOT NULL, "network" character varying(80) NOT NULL, "latencyLabel" character varying(80) NOT NULL, "latencyValue" character varying(40) NOT NULL, "products" text array NOT NULL DEFAULT '{}', "description" text NOT NULL, "latitude" double precision, "longitude" double precision, "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_5b9ac08c965a3293bb3af89f4e0" PRIMARY KEY ("_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ae9cc28fa716b66a5288c86a94" ON "location" ("city") `);
        await queryRunner.query(`CREATE TYPE "public"."plan_product_enum" AS ENUM('VPS Hosting', 'Windows VPS', 'Trading VPS', 'Dedicated Servers', 'Web Hosting', 'WordPress Hosting')`);
        await queryRunner.query(`CREATE TABLE "plan" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "product" "public"."plan_product_enum" NOT NULL, "name" character varying(120) NOT NULL, "tagline" character varying(200) NOT NULL DEFAULT '', "price" numeric(10,2) NOT NULL, "popular" boolean NOT NULL DEFAULT false, "location" character varying(80) NOT NULL, "specs" jsonb NOT NULL DEFAULT '{}', "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_6be587844fb12dd3c8bfe55a051" PRIMARY KEY ("_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_30c3d16d7ac7ab5b240fa9276d" ON "plan" ("product", "location") `);
        await queryRunner.query(`CREATE TYPE "public"."contact_message_status_enum" AS ENUM('New', 'Read', 'Archived')`);
        await queryRunner.query(`CREATE TABLE "contact_message" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(120) NOT NULL, "email" character varying(180) NOT NULL, "subject" character varying(200) NOT NULL, "message" text NOT NULL, "status" "public"."contact_message_status_enum" NOT NULL DEFAULT 'New', CONSTRAINT "PK_58247ecdb7e165d0f094cb5eaa6" PRIMARY KEY ("_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_usertype_enum" AS ENUM('admin', 'staff', 'client')`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('Active', 'Suspended')`);
        await queryRunner.query(`CREATE TABLE "user" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fullName" character varying(120) NOT NULL, "email" character varying(180) NOT NULL, "password" character varying(120) NOT NULL, "company" character varying(160), "userType" "public"."user_usertype_enum" NOT NULL DEFAULT 'client', "status" "public"."user_status_enum" NOT NULL DEFAULT 'Active', CONSTRAINT "PK_457bfa3e35350a716846b03102d" PRIMARY KEY ("_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE TYPE "public"."service_product_enum" AS ENUM('VPS Hosting', 'Windows VPS', 'Trading VPS', 'Dedicated Servers', 'Web Hosting', 'WordPress Hosting')`);
        await queryRunner.query(`CREATE TYPE "public"."service_status_enum" AS ENUM('Running', 'Issue', 'Suspended', 'Active')`);
        await queryRunner.query(`CREATE TABLE "service" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "serviceId" character varying(40) NOT NULL, "customerId" uuid NOT NULL, "planId" uuid, "product" "public"."service_product_enum" NOT NULL, "label" character varying(120) NOT NULL, "location" character varying(80) NOT NULL DEFAULT '', "status" "public"."service_status_enum" NOT NULL DEFAULT 'Running', "cpu" smallint, "ram" smallint, "disk" smallint, "expiresAt" date NOT NULL, "monthlyPrice" numeric(10,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_b99bce2b6999d1872fe69a4e199" PRIMARY KEY ("_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a33c7dfb23f788d7a9a0b7044d" ON "service" ("serviceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7eb1b97341e33d65b18ff66459" ON "service" ("customerId") `);
        await queryRunner.query(`CREATE TYPE "public"."invoice_status_enum" AS ENUM('Paid', 'Pending', 'Overdue')`);
        await queryRunner.query(`CREATE TABLE "invoice" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "number" character varying(40) NOT NULL, "customerId" uuid NOT NULL, "serviceId" uuid, "amount" numeric(10,2) NOT NULL, "status" "public"."invoice_status_enum" NOT NULL DEFAULT 'Pending', "dueAt" date NOT NULL, "paidAt" TIMESTAMP WITH TIME ZONE, "description" character varying(200) NOT NULL DEFAULT '', CONSTRAINT "PK_5daf8daca77cd608b70dbde8a5c" PRIMARY KEY ("_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_60284980bc8b9c624459948f4a" ON "invoice" ("number") `);
        await queryRunner.query(`CREATE INDEX "IDX_925aa26ea12c28a6adb614445e" ON "invoice" ("customerId") `);
        await queryRunner.query(`CREATE TABLE "product_content" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "product" character varying(80) NOT NULL, "heroBadge" character varying(120) NOT NULL DEFAULT '', "heroHeading1" character varying(160) NOT NULL DEFAULT '', "heroHeadingAccent" character varying(160) NOT NULL DEFAULT '', "heroSubheading" text NOT NULL DEFAULT '', "ctaHeading" character varying(200) NOT NULL DEFAULT '', "ctaSubheading" text NOT NULL DEFAULT '', "featureStrip" jsonb NOT NULL DEFAULT '[]', "whyChoose" jsonb NOT NULL DEFAULT '[]', "faq" jsonb NOT NULL DEFAULT '[]', "gridOneTitle" character varying(200) NOT NULL DEFAULT '', "gridOneSubtitle" text NOT NULL DEFAULT '', "gridOne" jsonb NOT NULL DEFAULT '[]', "gridTwoTitle" character varying(200) NOT NULL DEFAULT '', "gridTwoSubtitle" text NOT NULL DEFAULT '', "gridTwo" jsonb NOT NULL DEFAULT '[]', "locationCities" text array NOT NULL DEFAULT '{}', CONSTRAINT "PK_fb11e3b55231d0185f4df849078" PRIMARY KEY ("_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_57ba9c7666ebed4a79186d5e62" ON "product_content" ("product") `);
        await queryRunner.query(`CREATE TYPE "public"."ticket_priority_enum" AS ENUM('High', 'Medium', 'Low')`);
        await queryRunner.query(`CREATE TYPE "public"."ticket_status_enum" AS ENUM('Open', 'Pending', 'Closed')`);
        await queryRunner.query(`CREATE TABLE "ticket" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "number" integer NOT NULL, "subject" character varying(200) NOT NULL, "message" text NOT NULL, "customerId" uuid NOT NULL, "serviceId" uuid, "priority" "public"."ticket_priority_enum" NOT NULL DEFAULT 'Medium', "status" "public"."ticket_status_enum" NOT NULL DEFAULT 'Open', "lastActivityAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4405ac0cefa2ebd4fa5fbc54684" PRIMARY KEY ("_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a8d5171cdff59b4d6fc2c6d092" ON "ticket" ("number") `);
        await queryRunner.query(`CREATE INDEX "IDX_8932781487db15d1393b206482" ON "ticket" ("customerId") `);
        await queryRunner.query(`CREATE TYPE "public"."ticket_reply_authortype_enum" AS ENUM('staff', 'customer')`);
        await queryRunner.query(`CREATE TABLE "ticket_reply" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ticketId" uuid NOT NULL, "authorId" uuid NOT NULL, "authorType" "public"."ticket_reply_authortype_enum" NOT NULL, "authorName" character varying(120) NOT NULL, "text" text NOT NULL, CONSTRAINT "PK_508cd62ab85ca4df517fcad86c2" PRIMARY KEY ("_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4c9fd5af7ac2cb6563516fe351" ON "ticket_reply" ("ticketId") `);
        await queryRunner.query(`CREATE TYPE "public"."site_content_page_enum" AS ENUM('home', 'about', 'contact', 'support', 'footer', 'legal')`);
        await queryRunner.query(`CREATE TABLE "site_content" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "page" "public"."site_content_page_enum" NOT NULL, "content" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_e0a51b964f663366da9de5acefb" PRIMARY KEY ("_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8b0cbe926e0865e5785a1119d3" ON "site_content" ("page") `);
        await queryRunner.query(`CREATE TABLE "license" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(140) NOT NULL, "category" character varying(80) NOT NULL, "description" text NOT NULL DEFAULT '', "features" text array NOT NULL DEFAULT '{}', "price" numeric(10,2) NOT NULL, "installFee" numeric(10,2) NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_f4d8426b26fb6bf36078a15ab22" PRIMARY KEY ("_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a9b7b068cc3a7de34c2ca727ed" ON "license" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_5889720557376d5c6177977953" ON "license" ("category") `);
        await queryRunner.query(`ALTER TABLE "service" ADD CONSTRAINT "FK_7eb1b97341e33d65b18ff664596" FOREIGN KEY ("customerId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service" ADD CONSTRAINT "FK_46240ff82558089d99ec69c6076" FOREIGN KEY ("planId") REFERENCES "plan"("_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_925aa26ea12c28a6adb614445ee" FOREIGN KEY ("customerId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_14e015426d3712bffbe65be18f7" FOREIGN KEY ("serviceId") REFERENCES "service"("_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_8932781487db15d1393b206482e" FOREIGN KEY ("customerId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_0a5b29f8e1f78105dcb92e5aa79" FOREIGN KEY ("serviceId") REFERENCES "service"("_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_reply" ADD CONSTRAINT "FK_4c9fd5af7ac2cb6563516fe3513" FOREIGN KEY ("ticketId") REFERENCES "ticket"("_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket_reply" DROP CONSTRAINT "FK_4c9fd5af7ac2cb6563516fe3513"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_0a5b29f8e1f78105dcb92e5aa79"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_8932781487db15d1393b206482e"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_14e015426d3712bffbe65be18f7"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_925aa26ea12c28a6adb614445ee"`);
        await queryRunner.query(`ALTER TABLE "service" DROP CONSTRAINT "FK_46240ff82558089d99ec69c6076"`);
        await queryRunner.query(`ALTER TABLE "service" DROP CONSTRAINT "FK_7eb1b97341e33d65b18ff664596"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5889720557376d5c6177977953"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9b7b068cc3a7de34c2ca727ed"`);
        await queryRunner.query(`DROP TABLE "license"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b0cbe926e0865e5785a1119d3"`);
        await queryRunner.query(`DROP TABLE "site_content"`);
        await queryRunner.query(`DROP TYPE "public"."site_content_page_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4c9fd5af7ac2cb6563516fe351"`);
        await queryRunner.query(`DROP TABLE "ticket_reply"`);
        await queryRunner.query(`DROP TYPE "public"."ticket_reply_authortype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8932781487db15d1393b206482"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8d5171cdff59b4d6fc2c6d092"`);
        await queryRunner.query(`DROP TABLE "ticket"`);
        await queryRunner.query(`DROP TYPE "public"."ticket_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."ticket_priority_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_57ba9c7666ebed4a79186d5e62"`);
        await queryRunner.query(`DROP TABLE "product_content"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_925aa26ea12c28a6adb614445e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_60284980bc8b9c624459948f4a"`);
        await queryRunner.query(`DROP TABLE "invoice"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7eb1b97341e33d65b18ff66459"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a33c7dfb23f788d7a9a0b7044d"`);
        await queryRunner.query(`DROP TABLE "service"`);
        await queryRunner.query(`DROP TYPE "public"."service_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."service_product_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_usertype_enum"`);
        await queryRunner.query(`DROP TABLE "contact_message"`);
        await queryRunner.query(`DROP TYPE "public"."contact_message_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_30c3d16d7ac7ab5b240fa9276d"`);
        await queryRunner.query(`DROP TABLE "plan"`);
        await queryRunner.query(`DROP TYPE "public"."plan_product_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae9cc28fa716b66a5288c86a94"`);
        await queryRunner.query(`DROP TABLE "location"`);
    }

}
