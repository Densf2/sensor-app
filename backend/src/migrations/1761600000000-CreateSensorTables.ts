import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensorTables1761600000000 implements MigrationInterface {
  name = 'CreateSensorTables1761600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['temperature-sensors', 'humidity-sensors']) {
      await queryRunner.query(`
        CREATE TABLE "${table}" (
          "id" uuid NOT NULL DEFAULT gen_random_uuid(),
          "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "sensorName" character varying(200) NOT NULL,
          "value" double precision NOT NULL,
          "unit" character varying(20),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          CONSTRAINT "PK_${table}_id" PRIMARY KEY ("id")
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "humidity-sensors"`);
    await queryRunner.query(`DROP TABLE "temperature-sensors"`);
  }
}
