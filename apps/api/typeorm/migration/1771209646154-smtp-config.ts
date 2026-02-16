import { In, MigrationInterface, QueryRunner } from "typeorm";

export class SmtpConfig1771209646154 implements MigrationInterface {
  TABLE_NAME = "system_config";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(this.TABLE_NAME)
      .values({
        name: "SMTP服务器地址",
        key: "smtp:host",
        value: "",
        build_in: true,
        note: "",
      })
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(this.TABLE_NAME)
      .values({
        name: "SMTP服务器端口",
        key: "smtp:port",
        value: "",
        build_in: true,
        note: "请填入数字端口",
      })
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(this.TABLE_NAME)
      .values({
        name: "SMTP使用SSL",
        key: "smtp:ssl",
        value: "",
        build_in: true,
        note: "1-启用，0-不启用",
      })
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(this.TABLE_NAME)
      .values({
        name: "SMTP账号",
        key: "smtp:user",
        value: "",
        build_in: true,
        note: "",
      })
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(this.TABLE_NAME)
      .values({
        name: "SMTP密码",
        key: "smtp:pass",
        value: "",
        build_in: true,
        note: "",
      })
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from(this.TABLE_NAME)
      .where({
        key: In([
          "smtp:host",
          "smtp:port",
          "smpt:ssl",
          "smpt:user",
          "smpt:pass",
        ]),
      })
      .execute();
  }
}
