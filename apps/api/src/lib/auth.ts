import { bearer } from "@elysiajs/bearer";
import {
  ADMIN_AUTH_ISSUER,
  AuthValidateType,
  BusinessErrorCode,
  PermissionTreeNode,
} from "@rojer/mf-common";
import Elysia from "elysia";
import jwt from "jsonwebtoken";
import { isArray, isFinite } from "lodash-es";
import { JwtPayload } from "../interface";
import { AuthService } from "../modules/auth/auth.service";
import { OperationLogService } from "../modules/operation-log/operation-log.service";
import { SystemAccountService } from "../modules/system-account/system-account.service";
import { BusinessError } from "./error";
import { ipPlugin } from "./ip";
import { jwtPlugin } from "./jwt";

export const authPlugin = new Elysia({ name: "lib_auth" })
  .use(bearer())
  .use(
    jwtPlugin({
      algorithm: process.env.JWT_ALG as jwt.Algorithm,
      publicKey: process.env.JWT_PUBLIC as jwt.PublicKey,
      secretOrPrivateKey: process.env.JWT_PRIVATE as
        | jwt.PrivateKey
        | jwt.Secret,
    }),
  )
  .use(ipPlugin)
  .resolve({ as: "global" }, async ({ bearer, jwt }) => {
    if (bearer) {
      try {
        const payload = (await jwt.decode<JwtPayload>(
          bearer,
          ADMIN_AUTH_ISSUER,
        )) as unknown as JwtPayload;

        if (!payload || !isFinite(payload.userId) || payload.userId <= 0) {
          throw new BusinessError(BusinessErrorCode.Unauthorized);
        }

        const user = await SystemAccountService.findOneBy({
          id: payload.userId,
        });
        if (!user.active) throw new BusinessError(BusinessErrorCode.AccountBan);
        return { user };
      } catch (e) {
        console.error(e);
        if (e instanceof BusinessError) throw e;
        throw new BusinessError(BusinessErrorCode.Unauthorized);
      }
    }
    return { user: null };
  })
  .macro({
    auth: (
      authCofnig:
        | {
            validateType?: AuthValidateType;
            permission?: PermissionTreeNode | PermissionTreeNode[] | true;
            loggable?: false | { title?: string; isSaveRequestData?: boolean };
          }
        | (PermissionTreeNode | PermissionTreeNode[] | true),
    ) => ({
      async beforeHandle({ user }) {
        if (!user) {
          throw new BusinessError(BusinessErrorCode.Unauthorized);
        }

        let mixAuthConfig: {
          validateType?: AuthValidateType;
          permission?: PermissionTreeNode | PermissionTreeNode[] | true;
          loggable?: false | { title?: string; isSaveRequestData?: boolean };
        } = {};

        if (authCofnig === true) {
          mixAuthConfig = { permission: true };
        } else if (isArray(authCofnig)) {
          mixAuthConfig = {
            permission: authCofnig,
          };
        } else if ("key" in authCofnig) {
          mixAuthConfig = {
            permission: authCofnig,
          };
        } else {
          mixAuthConfig = authCofnig;
        }

        // true, 只需要验证登录状态
        if (mixAuthConfig.permission === true) return;

        const validateType: AuthValidateType =
          mixAuthConfig.validateType || "hasPermi";

        const validatePermissions: PermissionTreeNode[] = (
          [] as PermissionTreeNode[]
        ).concat(mixAuthConfig.permission || []);

        if (validatePermissions.length < 1)
          throw new BusinessError(BusinessErrorCode.IncorrectPermissionDefined);

        let validatePass = false;

        if (validateType === "hasPermi") {
          /** 验证是否具有xxx权限 */
          validatePass = await AuthService.hasPermi(
            user,
            validatePermissions[0]!.key,
          );
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

        /** 验证账号类型 */
        for (const permission of validatePermissions) {
          if (
            isArray(permission?.accountType) &&
            !permission?.accountType.includes(user?.accountType as any)
          ) {
            throw new BusinessError(BusinessErrorCode.Forbidden);
          }
        }
      },

      async afterResponse({ request, params, query, body, user, ip, set }) {
        let mixAuthConfig: {
          validateType?: AuthValidateType;
          permission?: PermissionTreeNode | PermissionTreeNode[] | true;
          loggable?: false | { title?: string; isSaveRequestData?: boolean };
        } = {};

        if (authCofnig === true) {
          mixAuthConfig = { permission: true };
        } else if (isArray(authCofnig)) {
          mixAuthConfig = {
            permission: authCofnig,
          };
        } else if ("key" in authCofnig) {
          mixAuthConfig = {
            permission: authCofnig,
          };
        } else {
          mixAuthConfig = authCofnig;
        }

        if (
          !user ||
          mixAuthConfig.loggable === false ||
          mixAuthConfig.permission === true
        )
          return;

        const errorSignal = set.headers["x-error-signal"];

        const success = !errorSignal;
        let errorMessage: string | undefined = undefined;
        if (!success) {
          errorMessage = decodeURIComponent(errorSignal as string);
        }

        const url = new URL(request.url);

        const validatePermissions: PermissionTreeNode[] = (
          [] as PermissionTreeNode[]
        ).concat(mixAuthConfig.permission || []);

        const isSaveRequestData =
          mixAuthConfig.loggable?.isSaveRequestData ?? true;

        const requestData = isSaveRequestData
          ? {
              query:
                query && Object.keys(query).length > 0
                  ? OperationLogService.sanitizeData(query)
                  : undefined,
              params:
                params && Object.keys(params).length > 0
                  ? OperationLogService.sanitizeData(params)
                  : undefined,
              body: body ? OperationLogService.sanitizeData(body) : undefined,
            }
          : {};

        await OperationLogService.createOperationLog({
          operatorId: user.id!,
          operatorAccount: user.account!,
          operatorName: user.realName!,
          permissionKey: validatePermissions[0]!.key,
          permissionName:
            mixAuthConfig.loggable?.title || validatePermissions[0]!.name,
          method: request.method,
          path: url.pathname,
          ip: ip,
          requestData,
          success,
          errorMessage: errorMessage ? errorMessage.slice(0, 512) : undefined,
        });
      },
    }),
  });
