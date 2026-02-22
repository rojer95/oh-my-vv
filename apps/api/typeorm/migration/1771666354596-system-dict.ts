import { MigrationInterface, QueryRunner, Table } from "typeorm";
import {
  Active,
  ActiveIndex,
  CreatedAt,
  CreatedAtIndex,
  Id,
  PgDataType,
  Sort,
  SortIndex,
  UpdatedAt,
} from "../migration-common-column";

export class SystemDict1771666354596 implements MigrationInterface {
  TABLE_NAME = "system_dict";
  DETAIL_TABLE_NAME = "system_dict_detail";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.TABLE_NAME,
        comment: "数据字典",
        columns: [
          Id(this.TABLE_NAME),

          {
            name: "name",
            type: PgDataType.varchar,
            length: "128",
            comment: "名称",
          },

          {
            name: "key",
            type: PgDataType.varchar,
            length: "128",
            comment: "唯一标识",
          },

          Active,

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
          ActiveIndex(this.TABLE_NAME),
          {
            name: `uuid_${this.TABLE_NAME}_key`,
            columnNames: ["key"],
            isUnique: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: this.DETAIL_TABLE_NAME,
        comment: "数据字典详情",
        columns: [
          Id(this.DETAIL_TABLE_NAME),

          {
            name: "system_dict_id",
            type: PgDataType.int,
            unsigned: true,
            comment: "字典ID",
          },

          {
            name: "name",
            type: PgDataType.varchar,
            length: "128",
            comment: "名称",
          },

          {
            name: "key",
            type: PgDataType.varchar,
            length: "128",
            comment: "键值",
          },

          Active,
          Sort,

          {
            name: "note",
            type: PgDataType.varchar,
            length: "512",
            isNullable: true,
            comment: "备注",
          },

          {
            name: "color",
            type: PgDataType.varchar,
            length: "36",
            isNullable: true,
            comment: "Tag颜色",
          },

          {
            name: "style",
            type: PgDataType.varchar,
            length: "512",
            isNullable: true,
            comment: "样式",
          },

          CreatedAt,
          UpdatedAt,
        ],
        indices: [
          CreatedAtIndex(this.DETAIL_TABLE_NAME),
          ActiveIndex(this.DETAIL_TABLE_NAME),
          SortIndex(this.DETAIL_TABLE_NAME),
          {
            name: `uuid_${this.DETAIL_TABLE_NAME}_key`,
            columnNames: ["system_dict_id", "key"],
            isUnique: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.DETAIL_TABLE_NAME);
    await queryRunner.dropTable(this.TABLE_NAME);
  }
}
