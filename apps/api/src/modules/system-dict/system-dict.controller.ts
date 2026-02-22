import { PERMISSIONS } from "@rojer/mf-common";
import Elysia from "elysia";
import z from "zod";
import { authPlugin } from "../../lib/auth";
import { curdPlugin } from "../../lib/curd";
import { zStringId } from "../../lib/custom-zod";
import { SystemDictService } from "./system-dict.service";
import {
  SystemDictCreateZod,
  SystemDictFastUpdateZod,
} from "./system-dict.dto";

export const systemDictController = new Elysia({ name: "systemDict" })
  .use(authPlugin)
  .use(curdPlugin)
  .group("system-dict", (app) =>
    app
      .post(
        "read",
        async ({ findManyOption }) => {
          return await SystemDictService.findAndCount(findManyOption);
        },
        {
          auth: { permission: PERMISSIONS.systemDictView, loggable: false },
          findManyOption: { tenantId: false },
        },
      )
      .post(
        "",
        async ({ body }) => {
          return await SystemDictService.create(body);
        },
        {
          body: SystemDictCreateZod,
          auth: PERMISSIONS.systemDictCreate,
        },
      )

      .put(
        "/:id",
        async ({ params, body }) => {
          return await SystemDictService.update({ id: params.id }, body);
        },
        {
          body: SystemDictCreateZod,
          auth: PERMISSIONS.systemDictUpdate,
          params: z.object({ id: zStringId }),
        },
      )
      .delete(
        "/:id",
        async ({ params }) => {
          await SystemDictService.delete({ id: params.id });
        },
        {
          auth: PERMISSIONS.systemDictDelete,
          params: z.object({ id: zStringId }),
        },
      )
      .put(
        "/:id/fastUpdate",
        async ({ params, body }) => {
          return await SystemDictService.update({ id: params.id }, body);
        },
        {
          body: SystemDictFastUpdateZod,
          auth: PERMISSIONS.systemDictUpdate,
          params: z.object({ id: zStringId }),
        },
      ),
  );
