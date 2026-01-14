import "reflect-metadata";
import type { Logger } from "typeorm";
import { DataSource, FileLogger } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategy";
import { Admin } from "../../entities/admin.entity";
import { logger } from "../winston/winston";
import { Logger as WinstonLogger } from "winston";

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
          appName: "TypeOrm",
        });
        break;
      case "info":
        this.typeormLogger.log({
          level: "info",
          message,
          appName: "TypeOrm",
        });
        break;
      case "warn":
        this.typeormLogger.log({
          level: "warn",
          message,
          appName: "TypeOrm",
        });
        break;
    }
  }

  override write(strings: string | string[]) {
    for (const string of [].concat(strings as any)) {
      this.typeormLogger.log({
        level: "info",
        message: string,
        appName: "TypeOrm",
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
  entities: [Admin],
  namingStrategy: new SnakeNamingStrategy(),
  logger: new TypeORMLogger(logger),
});
