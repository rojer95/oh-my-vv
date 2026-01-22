import { PERMISSIONS } from "@rojer/mf-common";
import Elysia from "elysia";
import { findManyOption } from "../../lib/find-many-option";
import { auth } from "../auth/auth.plugin";
import {
  SystemAccountCreateZod,
  SystemAccountResetPasswordZod,
  SystemAccountUpdateZod,
} from "./system-account.dto";
import { SystemAccountService } from "./system-account.service";
import { SystemRoleService } from "../system-role/system-role.service";

export const systemAccountController = new Elysia({ name: "systemAccount" })
  .use(auth)
  .use(findManyOption)
  .group("system-account", (app) =>
    app
      .get(
        "options",
        async () => {
          const roles = await SystemRoleService.find({
            where: {
              active: true,
            },
            select: ["id", "name"],
          });

          return { roles };
        },
        {
          auth: PERMISSIONS.systemAccountView,
        },
      )
      .post(
        "read",
        async ({ findManyOption }) => {
          return await SystemAccountService.findAndCount(findManyOption);
        },
        {
          auth: PERMISSIONS.systemAccountView,
          findManyOption: { tenantId: true },
        },
      )
      .post(
        "",
        async ({ body }) => {
          return await SystemAccountService.create(body);
        },
        {
          body: SystemAccountCreateZod,
          auth: PERMISSIONS.systemAccountCreate,
        },
      )
      .get(
        "/:id",
        async ({ params }) => {
          return await SystemAccountService.findById(Number(params.id));
        },
        {
          auth: PERMISSIONS.systemAccountView,
        },
      )
      .put(
        "/:id",
        async ({ params, body }) => {
          return await SystemAccountService.update(Number(params.id), body);
        },
        {
          body: SystemAccountUpdateZod,
          auth: PERMISSIONS.systemAccountUpdate,
        },
      )
      .delete(
        "/:id",
        async ({ params }) => {
          await SystemAccountService.delete(Number(params.id));
        },
        {
          auth: PERMISSIONS.systemAccountDelete,
        },
      )
      .put(
        "/:id/reset-password",
        async ({ params, body }) => {
          await SystemAccountService.resetPassword(
            Number(params.id),
            body.newPassword,
          );
        },
        {
          body: SystemAccountResetPasswordZod,
          auth: PERMISSIONS.systemAccountResetPassword,
        },
      ),
  );
