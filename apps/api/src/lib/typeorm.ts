import Elysia from "elysia";
import "reflect-metadata";
import type { Logger } from "typeorm";
import { DataSource, FileLogger } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategy";
import { Logger as WinstonLogger } from "winston";
import { SystemAccount } from "../modules/system-account/system-account.entity";
import { SystemDepartment } from "../modules/system-department/system-department.entity";
import { SystemOperationLog } from "../modules/operation-log/system-operation-log.entity";
import { SystemRole } from "../modules/system-role/system-role.entity";
import { SystemTenant } from "../modules/system-tenant/system-tenant.entity";
import { logger } from "./logger";
import { SystemConfig } from "../modules/system-config/system-config.entity";

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
    SystemConfig,
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
