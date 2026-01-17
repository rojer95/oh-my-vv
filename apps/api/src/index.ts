import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { PERMISSIONS } from "@rojer/mf-common";
import "dotenv/config";
import { Elysia } from "elysia";
import z from "zod";
import { permissionController } from "./controller/permission.controller";
import { auth } from "./lib/auth";
import { error } from "./lib/error";
import { queue } from "./lib/queue";
import { response } from "./lib/response";
import { typeorm } from "./lib/typeorm";
import { winston } from "./lib/winston";
import { logger } from "./lib/winston/winston";

z.config(z.locales.zhCN());

const app = new Elysia()
  .use(error)
  .use(staticPlugin())
  .use(typeorm())
  .use(winston)
  .use(cors())
  .use(response)
  .use(queue({ workers: ["test"] }))
  .use(permissionController)
  .listen(3000);

logger.info(`🦊 Elysia 運行中：${app.server?.hostname}:${app.server?.port}`);
export type App = typeof app;
