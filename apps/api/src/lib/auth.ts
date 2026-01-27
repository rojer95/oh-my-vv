import { bearer } from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";
import {
  AccountType,
  AuthValidateType,
  BusinessErrorCode,
  PermissionTreeNode,
} from "@rojer/mf-common";
import Elysia from "elysia";
import { isArray, isFinite } from "lodash-es";
import { JwtPayload } from "../interface";
import { AuthService } from "../modules/auth/auth.service";
import { OperationLogService } from "../modules/operation-log/operation-log.service";
import { SystemAccountService } from "../modules/system-account/system-account.service";
import { BusinessError } from "./error";
import { ipPlugin } from "./ip";

export const authPlugin = new Elysia({ name: "lib_auth" })
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

        if (!isFinite(payload.userId) || payload.userId <= 0) {
          throw new BusinessError(BusinessErrorCode.Unauthorized);
        }

        const user = await SystemAccountService.findOneBy({
          id: payload.userId,
        });
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
    auth: (
      permission:
        | true
        | PermissionTreeNode
        | {
            validateType: AuthValidateType;
            permission: PermissionTreeNode | PermissionTreeNode[];
          },
    ) => ({
      async beforeHandle({ user }) {
        if (!user) {
          throw new BusinessError(BusinessErrorCode.Unauthorized);
        }

        // true, 只需要验证登录状态
        if (permission === true) return;

        let validateType: AuthValidateType = "hasPermi";
        let validatePermissions: PermissionTreeNode[] = [];

        if ("validateType" in permission) {
          validateType = permission.validateType;
          if (
            validateType === "hasAnyPermi" &&
            !isArray(permission.permission)
          ) {
            throw new BusinessError(
              BusinessErrorCode.IncorrectPermissionDefined,
            );
          }

          validatePermissions = ([] as PermissionTreeNode[]).concat(
            permission.permission,
          );
        } else {
          validatePermissions = [permission];
        }

        if (validatePermissions.length < 1)
          throw new BusinessError(BusinessErrorCode.IncorrectPermissionDefined);

        let validatePass = false;
        if (validateType === "hasPermi") {
          /** 验证是否具有xxx权限 */
          validatePass = await AuthService.hasPermi(
            user,
            validatePermissions[0]!.key,
          );

          /** 验证是否具有系统的账号类型 */
          if (
            validatePass &&
            isArray(validatePermissions[0]!.accountType) &&
            !validatePermissions[0]!.accountType.includes(
              user.accountType as AccountType,
            )
          ) {
            validatePass = false;
          }
        } else if (validateType === "lacksPermi") {
          /** 验证是否不具有xxx权限 */
          validatePass = await AuthService.lacksPermi(
            user,
            validatePermissions[0]!.key,
          );
        } else if (validateType === "hasAnyPermi") {
          validatePass = await AuthService.hasAnyPermi(
            user,
            validatePermissions.map((i) => i.key),
          );
        }

        if (!validatePass) {
          throw new BusinessError(BusinessErrorCode.Forbidden);
        }
      },

      async afterResponse({ request, params, query, body, user, ip, set }) {
        if (
          !(
            permission !== true &&
            "loggable" in permission &&
            permission.loggable !== false
          ) ||
          !user
        )
          return;

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
          permissionName: permission.actionName || permission.name,
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
