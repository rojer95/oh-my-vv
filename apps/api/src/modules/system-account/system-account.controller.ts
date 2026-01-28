import { PERMISSIONS } from "@rojer/mf-common";
import Elysia from "elysia";
import { isFinite } from "lodash-es";
import { In } from "typeorm";
import z from "zod";
import { authPlugin } from "../../lib/auth";
import { curdPlugin } from "../../lib/curd";
import { zStringId } from "../../lib/custom-zod";
import { SystemDepartmentService } from "../system-department/system-department.service";
import { SystemRoleService } from "../system-role/system-role.service";
import {
  SystemAccountCreateZod,
  SystemAccountResetPasswordZod,
  SystemAccountUpdateZod,
} from "./system-account.dto";
import { SystemAccountService } from "./system-account.service";

export const systemAccountController = new Elysia({ name: "systemAccount" })
  .use(curdPlugin)
  .use(authPlugin)
  .group("system-account", (app) =>
    app
      .get(
        "options",
        async ({ tenantId }) => {
          const roles = await SystemRoleService.find({
            where: {
              active: true,
              tenantId,
            },
            select: ["id", "name"],
          });

          const departments =
            await SystemDepartmentService.findTreeByTenantId(tenantId);

          return { roles, departments };
        },
        {
          auth: { permission: PERMISSIONS.systemAccountView, loggable: false },
        },
      )
      .post(
        "read",
        async ({ findManyOption, tenantId }) => {
          if (isFinite(findManyOption.where?.departmentId)) {
            const departmentIds =
              await SystemDepartmentService.findSelfAndChildTreeIds({
                id: findManyOption.where?.departmentId,
                tenantId,
              });
            findManyOption.where.departmentId = In(departmentIds);
          }

          return await SystemAccountService.findAndCount(findManyOption);
        },
        {
          auth: { permission: PERMISSIONS.systemAccountView, loggable: false },
          findManyOption: true,
        },
      )
      .post(
        "",
        async ({ bodyWithTenantId }) => {
          return await SystemAccountService.create(bodyWithTenantId);
        },
        {
          body: SystemAccountCreateZod,
          auth: PERMISSIONS.systemAccountCreate,
        },
      )
      .put(
        "/:id",
        async ({ params, body, tenantId }) => {
          return await SystemAccountService.update(
            {
              id: params.id,
              tenantId,
            },
            body,
          );
        },
        {
          body: SystemAccountUpdateZod,
          auth: PERMISSIONS.systemAccountUpdate,
          params: z.object({ id: zStringId }),
        },
      )
      .delete(
        "/:id",
        async ({ params, tenantId }) => {
          await SystemAccountService.delete({
            id: params.id,
            tenantId,
          });
        },
        {
          auth: PERMISSIONS.systemAccountDelete,
          params: z.object({ id: zStringId }),
        },
      )
      .put(
        "/:id/reset-password",
        async ({ params, body, tenantId }) => {
          await SystemAccountService.resetPassword(
            {
              id: params.id,
              tenantId,
            },
            body.newPassword,
          );
        },
        {
          body: SystemAccountResetPasswordZod,
          auth: PERMISSIONS.systemAccountResetPassword,
          params: z.object({ id: zStringId }),
        },
      ),
  );
