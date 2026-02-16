import { In, MigrationInterface, QueryRunner } from "typeorm";

export class BuildInSystemConfig1769396936523 implements MigrationInterface {
  TABLE_NAME = "system_config";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(this.TABLE_NAME)
      .values({
        name: "重试次数",
        key: "sys:login:maxFailCount",
        value: "3",
        build_in: true,
        note: "登录验证码等场景最多重试次数，超过需要封禁一段时间",
      })
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(this.TABLE_NAME)
      .values({
        name: "封禁时间",
        key: "sys:login:ttl",
        value: "15",
        build_in: true,
        note: "超出重试次数封禁的时间（分钟）",
      })
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(this.TABLE_NAME)
      .values({
        name: "登录有效时间",
        key: "sys:login:exp",
        value: "2d",
        build_in: true,
        note: "登录后token有效时间，支持 30m 2h 1d 1y 等写法。",
      })
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from(this.TABLE_NAME)
      .where({
        key: In(["sys:login:maxFailCount", "sys:login:ttl", "sys:login:exp"]),
      })
      .execute();
  }
}
