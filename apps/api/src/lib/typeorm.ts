import Elysia from "elysia";
import "reflect-metadata";
import type { Logger } from "typeorm";
import { DataSource, FileLogger } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategy";
import { Logger as WinstonLogger } from "winston";
import { SystemAccount } from "../entity/system-account.entity";
import { SystemDepartment } from "../entity/system-department.entity";
import { SystemOperationLog } from "../entity/system-operation-log.entity";
import { SystemRole } from "../entity/system-role.entity";
import { SystemTenant } from "../entity/system-tenant.entity";
import { logger } from "./logger";

export class TypeORMLogger extends FileLogger implements Logger {
  constructor(readonly typeormLogger: WinstonLogger) {
    super(true);
  }

  override log(level: "log" | "info" | "warn", message: any) {
    switch (level) {
      case "log":
        this.typeormLogger.log({
          level: "debug",
          message,
          context: "TypeOrm",
        });
        break;
      case "info":
        this.typeormLogger.log({
          level: "info",
          message,
          context: "TypeOrm",
        });
        break;
      case "warn":
        this.typeormLogger.log({
          level: "warn",
          message,
          context: "TypeOrm",
        });
        break;
    }
  }

  override write(strings: string | string[]) {
    for (const string of [].concat(strings as any)) {
      this.typeormLogger.log({
        level: "info",
        message: string,
        context: "TypeOrm",
      });
    }
  }
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  synchronize: false,
  entities: [
    SystemAccount,
    SystemDepartment,
    SystemRole,
    SystemTenant,
    SystemOperationLog,
  ],
  namingStrategy: new SnakeNamingStrategy(),
  logger: new TypeORMLogger(logger),
});

export const typeormPlugin = async () => {
  // 1. 初始化数据库
  try {
    await AppDataSource.initialize();
    return new Elysia({ name: "lib_db" });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
