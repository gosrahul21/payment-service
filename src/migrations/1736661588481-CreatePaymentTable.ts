import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePaymentTable1736661588481 implements MigrationInterface {
    name = 'CreatePaymentTable1736661588481'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "UQ_ac823d34ce738a8ae433d5d3493" UNIQUE ("razorPayOrderId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "UQ_ac823d34ce738a8ae433d5d3493"`);
    }

}
