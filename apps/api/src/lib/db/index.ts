import Elysia from "elysia";
import { Admin } from "../../entities/admin.entity";
import { AppDataSource } from "./db";

// 1. 初始化数据库
await AppDataSource.initialize()
  .then(() => console.log("📂 Database connected"))
  .catch((error) => console.log("❌ Database connection error:", error));

export const db = new Elysia().decorate("db", {
  admin: AppDataSource.getRepository(Admin),
});
