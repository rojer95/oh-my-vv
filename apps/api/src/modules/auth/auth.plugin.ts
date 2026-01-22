import { bearer } from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";
import { BusinessErrorCode, PermissionTreeNode } from "@rojer/mf-common";
import Elysia from "elysia";
import { JwtPayload } from "../../interface";
import { BusinessError } from "../../lib/error";
import { ipPlugin } from "../../lib/ip";
import { SystemAccountService } from "../system-account/system-account.service";
import { AuthService } from "./auth.service";
import { OperationLogService } from "./operation-log.service";

export const auth = new Elysia({ name: "lib_auth" })
  .use(bearer())
  .use(
    jwt({
      name: "loginJwt",
      secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    }),
  )
  .use(ipPlugin)
  .resolve({ as: "global" }, async ({ bearer, loginJwt }) => {
    if (bearer) {
      try {
        const payload = (await loginJwt.verify(
          bearer,
        )) as unknown as JwtPayload;
        const user = await SystemAccountService.findById(payload.userId);
        if (!user.active) throw new BusinessError(BusinessErrorCode.AccountBan);
        return { user };
      } catch (e) {
        if (e instanceof BusinessError) throw e;
        throw new BusinessError(BusinessErrorCode.Unauthorized);
      }
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

      async afterResponse({ request, params, query, body, user, ip, set }) {
        const needsLog = permission !== true && permission.loggable !== false;
        if (!needsLog || !user) return;

        const errorSignal = set.headers["x-error-signal"];

        const success = !errorSignal;
        let errorMessage: string | undefined = undefined;
        if (!success) {
          errorMessage = decodeURIComponent(errorSignal as string);
        }

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
          success,
          errorMessage: errorMessage ? errorMessage.slice(0, 512) : undefined,
        });
      },
    }),
  });
