import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(cors())
  // 定義一個測試路由
  .get("/", () => ({ message: "Hello from Elysia!" }))
  // 定義一個帶有 Body 驗證的 POST 路由
  .post(
    "/user",
    ({ body }) => {
      return {
        id: 1,
        ...body,
      };
    },
    {
      body: t.Object({
        name: t.String(),
        age: t.Number(),
      }),
    }
  )
  .listen(3000);

console.log(`🦊 Elysia 運行中：${app.server?.hostname}:${app.server?.port}`);

// 【關鍵】導出 app 的類型，供前端使用
export type App = typeof app;
