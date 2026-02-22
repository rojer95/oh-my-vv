import { PERMISSIONS } from "@rojer/mf-common";
import Elysia from "elysia";
import z from "zod";
import { authPlugin } from "../../lib/auth";
import { curdPlugin } from "../../lib/curd";
import { zStringId } from "../../lib/custom-zod";

import { SystemDictDetailService } from "./system-dict-detail.service";
import {
  SystemDictDetailCreateZod,
  SystemDictDetailFastUpdateZod,
} from "./system-dict-detail.dto";

export const systemDictDetailController = new Elysia({
  name: "systemDictDetail",
})
  .use(authPlugin)
  .use(curdPlugin)
  .group("system-dict-detail", (app) =>
    app
      .post(
        "read",
        async ({ findManyOption }) => {
          return await SystemDictDetailService.findAndCount(findManyOption);
        },
        {
          auth: {
            permission: PERMISSIONS.systemDictDetailView,
            loggable: false,
          },
          findManyOption: { tenantId: false, defaultSort: { sort: "DESC" } },
        },
      )
      .post(
        "",
        async ({ body }) => {
          return await SystemDictDetailService.create(body);
        },
        {
          body: SystemDictDetailCreateZod,
          auth: PERMISSIONS.systemDictDetailCreate,
        },
      )

      .put(
        "/:id",
        async ({ params, body }) => {
          return await SystemDictDetailService.update({ id: params.id }, body);
        },
        {
          body: SystemDictDetailCreateZod,
          auth: PERMISSIONS.systemDictDetailUpdate,
          params: z.object({ id: zStringId }),
        },
      )
      .delete(
        "/:id",
        async ({ params }) => {
          await SystemDictDetailService.delete({ id: params.id });
        },
        {
          auth: PERMISSIONS.systemDictDetailDelete,
          params: z.object({ id: zStringId }),
        },
      )
      .put(
        "/:id/fastUpdate",
        async ({ params, body }) => {
          return await SystemDictDetailService.update({ id: params.id }, body);
        },
        {
          body: SystemDictDetailFastUpdateZod,
          auth: PERMISSIONS.systemDictDetailUpdate,
          params: z.object({ id: zStringId }),
        },
      ),
  );
