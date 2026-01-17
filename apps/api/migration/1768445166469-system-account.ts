import * as bcrypt from "bcryptjs";
import { MigrationInterface, QueryRunner, Table } from "typeorm";
import {
  Active,
  ActiveIndex,
  CreatedAt,
  CreatedAtIndex,
  DeletedAt,
  DeletedAtIndex,
  DepartmentId,
  DepartmentIndex,
  Id,
  TenantId,
  TenantIndex,
  PgDataType,
  UpdatedAt,
} from "../typeorm/migration-common-column";

export class SystemAccount1683172154412 implements MigrationInterface {
  TABLE_NAME = "system_account";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.TABLE_NAME,
        comment: "系统账号表",
        columns: [
          Id(this.TABLE_NAME),
          TenantId,
          DepartmentId,
          {
            name: "account",
            type: PgDataType.varchar,
            length: "64",
            comment: "账号",
          },
          {
            name: "origin_account",
            type: PgDataType.varchar,
            length: "64",
            comment: "被删除前的原账号",
            default: "''",
          },
          {
            name: "account_type",
            type: PgDataType.varchar,
            length: "32",
            comment: "账号类型",
          },
          {
            name: "password",
            type: PgDataType.varchar,
            length: "64",
            comment: "密码",
          },
          {
            name: "real_name",
            type: PgDataType.varchar,
            length: "16",
            comment: "姓名",
          },
          {
            name: "phone",
            type: PgDataType.varchar,
            length: "12",
            comment: "手机",
            default: "''",
          },
          {
            name: "mail",
            type: PgDataType.varchar,
            length: "64",
            comment: "邮箱",
            default: "''",
          },
          {
            name: "login_count",
            type: PgDataType.int,
            unsigned: true,
            comment: "登录次数",
            default: 0,
          },
          Active,
          {
            name: "is_super",
            type: PgDataType.boolean,
            comment: "超管 1-是 0-否",
            default: false,
          },
          {
            name: "role",
            type: PgDataType.jsonb,
            comment: "角色id",
          },
          {
            name: "last_ip",
            type: PgDataType.varchar,
            length: "45",
            comment: "最后登录ip",
            default: "''",
          },
          {
            name: "last_time",
            type: PgDataType.timestamp,
            comment: "最后登录时间",
            default: "NOW()",
          },
          {
            name: "totp_secret",
            type: PgDataType.varchar,
            length: "64",
            comment: "totp密钥",
            default: "''",
          },
          CreatedAt,
          UpdatedAt,
          DeletedAt,
        ],
        indices: [
          TenantIndex(this.TABLE_NAME),
          DepartmentIndex(this.TABLE_NAME),
          ActiveIndex(this.TABLE_NAME),
          CreatedAtIndex(this.TABLE_NAME),
          DeletedAtIndex(this.TABLE_NAME),

          {
            name: `uid_${this.TABLE_NAME}_account`,
            columnNames: ["account"],
            isUnique: true,
          },
          {
            name: `idx_${this.TABLE_NAME}_account_type`,
            columnNames: ["account_type"],
          },
        ],
      })
    );

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(this.TABLE_NAME)
      .values({
        account: "admin",
        account_type: "platform",
        password: bcrypt.hashSync("admin", bcrypt.genSaltSync(10)),
        real_name: "admin",
        is_super: true,
        role: "[]",
      })
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.TABLE_NAME);
  }
}
