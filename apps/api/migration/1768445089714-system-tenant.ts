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
  UpdatedAt,
} from "../typeorm/migration-common-column";

export class SystemTenant1768445089714 implements MigrationInterface {
  TABLE_NAME = "system_tenant";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.TABLE_NAME,
        comment: "商户表",
        columns: [
          Id(this.TABLE_NAME),
          {
            name: "name",
            type: PgDataType.varchar,
            length: "128",
            comment: "商户名称",
          },

          Active,
          Sort,

          CreatedAt,
          UpdatedAt,
          DeletedAt,
        ],
        indices: [
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
