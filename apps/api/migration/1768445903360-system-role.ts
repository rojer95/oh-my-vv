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
} from "../typeorm/migration-common-column";

export class SystemRole1768445903360 implements MigrationInterface {
  TABLE_NAME = "system_role";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.TABLE_NAME,
        comment: "系统角色表",
        columns: [
          Id(this.TABLE_NAME),
          TenantId,
          {
            name: "name",
            type: PgDataType.varchar,
            length: "128",
            comment: "名称",
          },
          Active,
          Sort,
          {
            name: "menu_perm",
            type: PgDataType.jsonb,
            comment: "菜单权限集",
          },

          {
            name: "data_perm_type",
            type: PgDataType.enum,
            enum: ["all", "custom", "department", "departments", "user"],
            comment: "数据权限集类型",
          },

          {
            name: "department",
            type: PgDataType.jsonb,
            comment: "自定义部门ID",
          },

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
          {
            name: `idx_${this.TABLE_NAME}_data_perm_type`,
            columnNames: ["data_perm_type"],
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.TABLE_NAME);
  }
}
