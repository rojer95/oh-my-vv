import { MigrationInterface, QueryRunner, Table } from "typeorm";
import {
  CreatedAt,
  CreatedAtIndex,
  Id,
  PgDataType,
  UpdatedAt,
} from "../migration-common-column";

export class SystemConfig1768729328833 implements MigrationInterface {
  TABLE_NAME = "system_config";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.TABLE_NAME,
        comment: "系统配置",
        columns: [
          Id(this.TABLE_NAME),

          {
            name: "name",
            type: PgDataType.varchar,
            length: "128",
            comment: "参数名称",
          },

          {
            name: "key",
            type: PgDataType.varchar,
            length: "128",
            comment: "参数键名",
          },

          {
            name: "value",
            type: PgDataType.varchar,
            length: "1024",
            comment: "参数键值",
          },

          {
            name: "build_in",
            type: PgDataType.boolean,
            default: false,
            comment: "内置",
          },
          {
            name: "note",
            type: PgDataType.varchar,
            length: "512",
            isNullable: true,
            comment: "备注",
          },
          CreatedAt,
          UpdatedAt,
        ],
        indices: [
          CreatedAtIndex(this.TABLE_NAME),
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
