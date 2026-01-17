import { MigrationInterface, QueryRunner, Table } from "typeorm";
import {
  Active,
  ActiveIndex,
  CreatedAt,
  CreatedAtIndex,
  DeletedAt,
  DeletedAtIndex,
  Id,
  PgDataType,
  Sort,
  SortIndex,
  TenantId,
  TenantIndex,
  UpdatedAt,
} from "../migration-common-column";

export class SystemDepartment1768445166468 implements MigrationInterface {
  TABLE_NAME = "system_department";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.TABLE_NAME,
        comment: "部门表",
        columns: [
          Id(this.TABLE_NAME),
          TenantId,

          {
            name: "name",
            type: PgDataType.varchar,
            length: "128",
            comment: "部门名称",
          },

          {
            name: "parent_id",
            type: PgDataType.int,
            unsigned: true,
            comment: "上级id",
            isNullable: true,
          },

          {
            name: "mpath",
            type: PgDataType.varchar,
            length: "256",
            default: "''",
            comment: "树结构",
          },

          Active,
          Sort,

          CreatedAt,
          UpdatedAt,
          DeletedAt,
        ],
        indices: [
          TenantIndex(this.TABLE_NAME),
          ActiveIndex(this.TABLE_NAME),
          SortIndex(this.TABLE_NAME),
          CreatedAtIndex(this.TABLE_NAME),
          DeletedAtIndex(this.TABLE_NAME),
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.TABLE_NAME);
  }
}
