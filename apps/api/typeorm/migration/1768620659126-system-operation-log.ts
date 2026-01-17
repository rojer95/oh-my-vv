import { MigrationInterface, QueryRunner, Table } from "typeorm";
import {
  CreatedAt,
  CreatedAtIndex,
  Id,
  PgDataType,
  TenantId,
  TenantIndex,
  UpdatedAt,
} from "../migration-common-column";

export class SystemOperationLog1768620659126 implements MigrationInterface {
  TABLE_NAME = "system_operation_log";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.TABLE_NAME,
        comment: "系统操作日志表",
        columns: [
          Id(this.TABLE_NAME),
          TenantId,
          {
            name: "operator_id",
            type: PgDataType.bigint,
            comment: "操作人ID",
          },
          {
            name: "operator_account",
            type: PgDataType.varchar,
            length: "64",
            comment: "操作人账号",
          },
          {
            name: "operator_name",
            type: PgDataType.varchar,
            length: "64",
            comment: "操作人姓名",
          },
          {
            name: "permission_key",
            type: PgDataType.varchar,
            length: "128",
            comment: "权限key",
          },
          {
            name: "permission_name",
            type: PgDataType.varchar,
            length: "128",
            comment: "权限名称",
          },
          {
            name: "method",
            type: PgDataType.varchar,
            length: "16",
            comment: "请求方法",
          },
          {
            name: "path",
            type: PgDataType.varchar,
            length: "512",
            comment: "请求路径",
          },
          {
            name: "ip",
            type: PgDataType.varchar,
            length: "64",
            comment: "IP地址",
          },
          {
            name: "request_data",
            type: PgDataType.jsonb,
            comment: "请求数据",
          },
          {
            name: "success",
            type: PgDataType.boolean,
            default: true,
            comment: "操作是否成功",
          },
          {
            name: "error_message",
            type: PgDataType.varchar,
            length: "512",
            isNullable: true,
            comment: "错误信息",
          },
          CreatedAt,
          UpdatedAt,
        ],
        indices: [
          TenantIndex(this.TABLE_NAME),
          CreatedAtIndex(this.TABLE_NAME),
          {
            name: `idx_${this.TABLE_NAME}_operator_id`,
            columnNames: ["operator_id"],
          },
          {
            name: `idx_${this.TABLE_NAME}_permission_key`,
            columnNames: ["permission_key"],
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.TABLE_NAME);
  }
}
