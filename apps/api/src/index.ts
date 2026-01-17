import "dotenv/config";
import { bearer } from "@elysiajs/bearer";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import z from "zod";
import { error } from "./lib/error";
import { queue } from "./lib/queue";
import { response } from "./lib/response";
import { typeorm } from "./lib/typeorm";
import { winston } from "./lib/winston";
import { logger } from "./lib/winston/winston";

z.config(z.locales.zhCN());

// const connection = { host: "localhost", port: 6379 };
// const videoQueue = new Queue("video-process", { connection });

const app = new Elysia()
  .use(error)
  .use(staticPlugin())
  .use(typeorm())
  .use(winston)
  .use(bearer())
  .use(cors())
  .use(response)
  .use(queue({ workers: ["test"] }))
  .group("/api", (app) =>
    app // 定義一個測試路由
      .get(
        "/",
        ({ bearer, query }) => {
          return {
            message: "Hello from Elysia!",
            bearer,
            query,
          };
        },
        {
          query: z.object({
            t: z.string(),
          }),
        }
      )

      // 定義一個帶有 Body 驗證的 POST 路由
      .get("/admins", async ({ db, logger }) => {
        return [];
      })
  )
  .listen(3000);

logger.info(`🦊 Elysia 運行中：${app.server?.hostname}:${app.server?.port}`);
// 【關鍵】導出 app 的類型，供前端使用
export type App = typeof app;
