import { PERMISSIONS } from "@rojer/mf-common";
import { Elysia } from "elysia";
import type { z } from "zod";
import { auth } from "../auth/auth.plugin";
import { SystemConfigService } from "./system-config.service";
import {
  SystemConfigCreateZod,
  SystemConfigUpdateZod,
  SystemConfigQueryZod,
} from "./system-config.dto";
import { typeormOption } from "../../lib/typeorm-option";

export const systemConfigController = new Elysia({ name: "systemConfig" })
  .use(auth)
  .use(typeormOption)
  .group("system-config", (app) =>
    app
      .post(
        "read",
        async ({ query, findManyOption }) => {
          return await SystemConfigService.findAndCount(findManyOption);
        },
        {
          query: SystemConfigQueryZod,
          auth: PERMISSIONS.systemConfigView,
          findManyOption: { tenantId: false },
        },
      )
      .get(
        "/:id",
        async ({ params }) => {
          return await SystemConfigService.findById(Number(params.id));
        },
        {
          auth: PERMISSIONS.systemConfigView,
        },
      )
      .get(
        "/key/:key",
        async ({ params }) => {
          return await SystemConfigService.findByKey(params.key);
        },
        {
          auth: PERMISSIONS.systemConfigView,
        },
      )
      .post(
        "",
        async ({ body }) => {
          return await SystemConfigService.create(body);
        },
        {
          body: SystemConfigCreateZod,
          auth: PERMISSIONS.systemConfigCreate,
        },
      )
      .put(
        "/:id",
        async ({ params, body }) => {
          return await SystemConfigService.update(Number(params.id), body);
        },
        {
          body: SystemConfigUpdateZod,
          auth: PERMISSIONS.systemConfigUpdate,
        },
      )
      .delete(
        "/:id",
        async ({ params }) => {
          await SystemConfigService.delete(Number(params.id));
        },
        {
          auth: PERMISSIONS.systemConfigDelete,
        },
      ),
  );
