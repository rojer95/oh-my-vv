import "dotenv/config";

import { bearer } from "@elysiajs/bearer";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { error } from "./lib/error";
import { response } from "./lib/response";
import { typeorm } from "./lib/typeorm";
import { winston } from "./lib/winston";
import z from "zod";
import { Queue } from "bullmq";

z.config(z.locales.zhCN());

const connection = { host: "localhost", port: 6379 };
const videoQueue = new Queue("video-process", { connection });

const app = new Elysia()
  .use(error)
  .use(staticPlugin())
  .use(typeorm())
  .use(winston)
  .use(bearer())
  .use(cors())
  .use(response)
  .decorate("videoQueue", videoQueue)
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
      .get("/queue", async ({ videoQueue }) => {
        const job = await videoQueue.add("task", { data: 1 });
        return { jobId: job.id };
      })
      // 定義一個帶有 Body 驗證的 POST 路由
      .get("/admins", async ({ db, logger }) => {
        return await db.admin.find();
      })
  )
  .onStart(() => {
    // 🔥 关键：在主进程启动时，派生出一个子线程跑 Worker
    // 使用 import.meta.url 确保路径正确
    new Worker(new URL("./queue/test.worker.ts", import.meta.url).href);
    console.log("🚀 Web Server 和 Worker 线程已就绪");
  })
  .listen(3000);

console.log(`🦊 Elysia 運行中：${app.server?.hostname}:${app.server?.port}`);
// 【關鍵】導出 app 的類型，供前端使用
export type App = typeof app;
