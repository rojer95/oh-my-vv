import { MigrationInterface, QueryRunner, Table } from "typeorm";
import {
  Active,
  ActiveIndex,
  CreatedAt,
  CreatedAtIndex,
  Id,
  PgDataType,
  UpdatedAt,
} from "../migration-common-column";

export class AiModelProvider1773817334682 implements MigrationInterface {
  TABLE_NAME = "ai_model_provider";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.TABLE_NAME,
        comment: "AI模型提供商",
        columns: [
          Id(this.TABLE_NAME),

          {
            name: "name",
            type: PgDataType.varchar,
            length: "128",
            comment: "模型提供商名称",
          },

          {
            name: "key",
            type: PgDataType.varchar,
            length: "128",
            comment: "模型提供商key",
          },

          Active,

          {
            name: "options",
            type: PgDataType.json,
            isNullable: true,
            comment: "提供商配置",
          },

          CreatedAt,
          UpdatedAt,
        ],
        indices: [
          CreatedAtIndex(this.TABLE_NAME),
          ActiveIndex(this.TABLE_NAME),
          {
            name: `uuid_${this.TABLE_NAME}_key`,
            columnNames: ["key"],
            isUnique: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.TABLE_NAME);
  }
}
