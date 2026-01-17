import { bearer } from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";
import { PermissionTreeNode } from "@rojer/mf-common";
import Elysia from "elysia";
import { SystemAccount } from "../../entity/system-account.entity";
import { BusinessError } from "../../lib/error";
import { AppDataSource } from "../../lib/typeorm";
import { PermissionService } from "./permission.service";
import { sanitizeData } from "./util";
import { OperationLogService } from "./operation-log.service";
import { JwtPayload } from "../../interface";
import { SystemAccountService } from "./system-account.service";

export const auth = new Elysia({ name: "lib_auth" })
  .use(bearer())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    })
  )
  .derive({ as: "global" }, async ({ bearer, jwt }) => {
    if (bearer) {
      try {
        const payload = (await jwt.verify(bearer)) as unknown as JwtPayload;
        const user = await SystemAccountService.findOneBy({
          id: payload.userId,
          active: true,
        });
        return { user };
      } catch {}
    }
    return { user: null };
  })
  .macro({
    auth: (permission: PermissionTreeNode) => ({
      async beforeHandle({ set, user }) {
        if (!user) {
          throw new BusinessError(401);
        }

        const hasPerm = await PermissionService.checkPermission(
          user,
          permission.key
        );

        if (!hasPerm) {
          throw new BusinessError(403);
        }

        set.headers["x-permission-key"] = permission.key;
        set.headers["x-permission-name"] = permission.action || permission.name;
        set.headers["x-permission-loggable"] = String(
          permission.loggable !== false
        );
      },
      async afterResponse({
        set,
        request,
        params,
        query,
        body,
        user,
        responseValue,
      }) {
        const needsLog = set.headers["x-permission-loggable"] === "true";

        if (!needsLog || !user) return;

        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0] ||
          request.headers.get("x-real-ip") ||
          "unknown";

        const success = (responseValue as any)?.response?.code === 0;
        let errorMessage: string | undefined = undefined;
        if (!success) errorMessage = (responseValue as any)?.response?.message;
        const url = new URL(request.url);

        await OperationLogService.createOperationLog({
          operatorId: user.id!,
          operatorAccount: user.account!,
          operatorName: user.realName!,
          permissionKey: set.headers["x-permission-key"] as string,
          permissionName: set.headers["x-permission-name"] as string,
          method: request.method,
          path: url.pathname,
          ip: ip,
          requestData: {
            query: query ? sanitizeData(query) : {},
            params: params ? sanitizeData(params) : {},
            body: body ? sanitizeData(body) : undefined,
          },
          success,
          errorMessage,
        });
      },
    }),
  });
