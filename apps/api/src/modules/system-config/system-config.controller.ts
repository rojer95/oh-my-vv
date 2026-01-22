import { PERMISSIONS } from "@rojer/mf-common";
import { Elysia } from "elysia";
import { findManyOption } from "../../lib/find-many-option";
import { auth } from "../auth/auth.plugin";
import {
  SystemConfigCreateZod,
  SystemConfigUpdateZod,
} from "./system-config.dto";
import { SystemConfigService } from "./system-config.service";

export const systemConfigController = new Elysia({ name: "systemConfig" })
  .use(auth)
  .use(findManyOption)
  .group("system-config", (app) =>
    app
      .post(
        "read",
        async ({ findManyOption }) => {
          return await SystemConfigService.findAndCount(findManyOption);
        },
        {
          auth: PERMISSIONS.systemConfigView,
          findManyOption: { tenantId: false },
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
