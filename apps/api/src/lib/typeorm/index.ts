import Elysia from "elysia";
import { AppDataSource } from "./db";

export const typeorm = async () => {
  // 1. 初始化数据库
  try {
    await AppDataSource.initialize();
    return new Elysia({ name: "lib_db" }).decorate("db", AppDataSource);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
