import { bearer } from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";
import { BusinessErrorCode, PermissionTreeNode } from "@rojer/mf-common";
import Elysia from "elysia";
import { JwtPayload } from "../../interface";
import { BusinessError } from "../../lib/error";
import { ipPlugin } from "../../lib/ip";
import { AuthService } from "./auth.service";
import { OperationLogService } from "./operation-log.service";
import { SystemAccountService } from "./system-account.service";

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
      async beforeHandle({ user }) {
        if (!user) {
          throw new BusinessError(BusinessErrorCode.Unauthorized);
        }

        // true, 只需要验证登录状态
        if (permission === true) return;

        const hasPerm = await AuthService.checkPermission(user, permission.key);

        if (!hasPerm) {
          throw new BusinessError(BusinessErrorCode.Forbidden);
        }
      },
      async afterResponse({
        request,
        params,
        query,
        body,
        user,
        responseValue,
        ip,
      }) {
        const needsLog = permission !== true && permission.loggable !== false;

        if (!needsLog || !user) return;

        const fail =
          typeof (responseValue as any)?.response?.code === "number" &&
          (responseValue as any)?.response?.code !== 0;

        let errorMessage: string | undefined = undefined;
        if (fail) errorMessage = (responseValue as any)?.response?.message;
        const url = new URL(request.url);

        await OperationLogService.createOperationLog({
          operatorId: user.id!,
          operatorAccount: user.account!,
          operatorName: user.realName!,
          permissionKey: permission.key,
          permissionName: permission.action || permission.name,
          method: request.method,
          path: url.pathname,
          ip: ip,
          requestData: {
            query: query ? OperationLogService.sanitizeData(query) : {},
            params: params ? OperationLogService.sanitizeData(params) : {},
            body: body ? OperationLogService.sanitizeData(body) : undefined,
          },
          success: !fail,
          errorMessage,
        });
      },
    }),
  });
