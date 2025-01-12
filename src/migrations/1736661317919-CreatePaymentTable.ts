import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePaymentTable1736661317919 implements MigrationInterface {
    name = 'CreatePaymentTable1736661317919'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "UQ_d09d285fe1645cd2f0db811e293" UNIQUE ("orderId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "UQ_d09d285fe1645cd2f0db811e293"`);
    }

}
