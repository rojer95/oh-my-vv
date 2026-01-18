import "dotenv/config";

import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import z from "zod";
import { errorPlugin } from "./lib/error";
import { loggerPlugin } from "./lib/logger";
import { queueWorkerPlugin } from "./lib/queue-worker";
import { responsePlugin } from "./lib/response";
import { typeormPlugin } from "./lib/typeorm";
import { allRoutes } from "./route";

z.config(z.locales.zhCN());

const app = new Elysia()
  .use(staticPlugin())
  .use(errorPlugin())
  .use(typeormPlugin())
  .use(loggerPlugin())
  .use(cors())
  .use(responsePlugin())
  .use(queueWorkerPlugin({ workers: ["mail"] }))
  .use(allRoutes)
  .listen(3000);

console.log(`🦊 Elysia 運行中：${app.server?.hostname}:${app.server?.port}`);
export type App = typeof app;
