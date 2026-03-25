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

export class AiModel1773825841378 implements MigrationInterface {
  TABLE_NAME = "ai_model";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.TABLE_NAME,
        comment: "AI模型",
        columns: [
          Id(this.TABLE_NAME),

          {
            name: "name",
            type: PgDataType.varchar,
            length: "128",
            comment: "模型名称",
          },

          {
            name: "key",
            type: PgDataType.varchar,
            length: "128",
            comment: "模型key",
          },

          {
            name: "provider_id",
            type: PgDataType.int,
            comment: "提供商ID",
          },

          {
            name: "type",
            type: PgDataType.enum,
            enum: ["text", "image", "video", "speech"],
            comment: "类型",
          },

          Active,

          {
            name: "options",
            type: PgDataType.json,
            isNullable: true,
            comment: "其他配置",
          },

          CreatedAt,
          UpdatedAt,
        ],
        indices: [
          CreatedAtIndex(this.TABLE_NAME),
          ActiveIndex(this.TABLE_NAME),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.TABLE_NAME);
  }
}
