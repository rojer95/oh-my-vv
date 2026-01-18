import { bearer } from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";
import { BusinessErrorCode, PermissionTreeNode } from "@rojer/mf-common";
import Elysia from "elysia";
import { JwtPayload } from "../../interface";
import { BusinessError } from "../../lib/error";
import { OperationLogService } from "./operation-log.service";
import { AuthService } from "./auth.service";
import { SystemAccountService } from "./system-account.service";
import { sanitizeData } from "./util";
import { ipPlugin } from "../../lib/ip";

export const auth = new Elysia({ name: "lib_auth" })
  .use(bearer())
  .use(
    jwt({
      name: "loginJwt",
      secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    }),
  )
  .use(ipPlugin)
  .derive({ as: "global" }, async ({ bearer, loginJwt }) => {
    if (bearer) {
      try {
        const payload = (await loginJwt.verify(
          bearer,
        )) as unknown as JwtPayload;
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
    auth: (permission: PermissionTreeNode | true) => ({
      async beforeHandle({ set, user }) {
        if (!user) {
          throw new BusinessError(BusinessErrorCode.Unauthorized);
        }

        // true, 只需要验证登录状态
        if (permission === true) return;

        const hasPerm = await AuthService.checkPermission(user, permission.key);

        if (!hasPerm) {
          throw new BusinessError(BusinessErrorCode.Forbidden);
        }

        set.headers["x-permission-key"] = permission.key;
        set.headers["x-permission-name"] = permission.action || permission.name;
        set.headers["x-permission-loggable"] = String(
          permission.loggable !== false,
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
        ip,
      }) {
        const needsLog = set.headers["x-permission-loggable"] === "true";

        if (!needsLog || !user) return;

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
