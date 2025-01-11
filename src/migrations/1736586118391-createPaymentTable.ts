import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePaymentTable1736586118391 implements MigrationInterface {
    name = 'CreatePaymentTable1736586118391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('PENDING', 'SUCCESSFULL', 'FAILED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" character varying NOT NULL, "razorPayOrderId" character varying, "razorpayPaymentId" character varying, "status" "public"."payment_status_enum" NOT NULL DEFAULT 'PENDING', "amount" numeric NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
    }

}
