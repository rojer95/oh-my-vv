import { cors } from "@elysiajs/cors";
import "dotenv/config";
import { Elysia } from "elysia";
import { typeorm } from "./lib/typeorm";
import { error } from "./lib/error";
import { response } from "./lib/response";
import { winston } from "./lib/winston";

const app = new Elysia()
  .use(error)
  .use(typeorm())
  .use(winston)
  .use(response)
  .use(cors())
  .group("/api", (app) =>
    app // 定義一個測試路由
      .get("/", () => {
        return {
          message: "Hello from Elysia!",
        };
      })
      // 定義一個帶有 Body 驗證的 POST 路由
      .get("/admins", async ({ db, logger }) => {
        return await db.admin.find();
      })
  )
  .listen(3000);

console.log(`🦊 Elysia 運行中：${app.server?.hostname}:${app.server?.port}`);

// 【關鍵】導出 app 的類型，供前端使用
export type App = typeof app;
