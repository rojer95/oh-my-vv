import Elysia from "elysia";
import { Admin } from "../../entities/admin.entity";
import { AppDataSource } from "./db";

export const typeorm = async () => {
  // 1. 初始化数据库
  try {
    await AppDataSource.initialize();
    return new Elysia().decorate("db", {
      admin: AppDataSource.getRepository(Admin),
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
