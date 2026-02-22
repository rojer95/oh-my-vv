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
import { FindOperator } from "typeorm";
import { JwtPayload } from "../interface";
import { AuthService } from "../modules/auth/auth.service";
import { SystemAccountService } from "../modules/system-account/system-account.service";
import { SystemOperationLogService } from "../modules/system-operation-log/system-operation-log.service";
import { BusinessError } from "./error";
import { ipPlugin } from "./ip";
import { jwtPlugin } from "./jwt";

type AuthConfig =
  | {
      validateType?: AuthValidateType;
      permission?: PermissionTreeNode | PermissionTreeNode[] | true;
      loggable?: false | { title?: string; isSaveRequestData?: boolean };
    }
  | (PermissionTreeNode | PermissionTreeNode[] | true);

type MixAuthConfig = {
  validateType?: AuthValidateType;
  permission?: PermissionTreeNode | PermissionTreeNode[] | true;
  loggable?: false | { title?: string; isSaveRequestData?: boolean };
};

export type AuthValidateResult = {
  pass: boolean;
  isSuper: boolean;
  dataDeptIds?: FindOperator<number>;
  dataUserIds?: FindOperator<number>;
};

const getMixAuthConfigFromConfig = (authCofnig: AuthConfig): MixAuthConfig => {
  let mixAuthConfig: MixAuthConfig = {};

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

  return mixAuthConfig;
};

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
    auth: (authConfig: AuthConfig) => ({
      resolve: async ({ user }) => {
        if (!user) {
          throw new BusinessError(BusinessErrorCode.Unauthorized);
        }

        const mixAuthConfig = getMixAuthConfigFromConfig(authConfig);

        // true, 只需要验证登录状态
        if (mixAuthConfig.permission === true) return;

        const validateType: AuthValidateType =
          mixAuthConfig.validateType || "hasPermi";

        const validatePermissions: PermissionTreeNode[] = (
          [] as PermissionTreeNode[]
        )
          .concat(mixAuthConfig.permission || [])
          .slice(0, validateType === "hasAnyPermi" ? undefined : 1);

        if (validatePermissions.length < 1)
          throw new BusinessError(BusinessErrorCode.IncorrectPermissionDefined);

        let validateResult: AuthValidateResult = {
          pass: false,
          isSuper: false,
        };

        if (validateType === "lacksPermi") {
          /** 验证是否不具有xxx权限 */
          validateResult = await AuthService.lacksPermi(
            user,
            validatePermissions[0]!.key,
          );
        } else {
          /** 验证包含其中一个权限 */
          validateResult = await AuthService.hasAnyPermi(
            user,
            validatePermissions.map((i) => i.key),
          );
        }

        if (!validateResult.pass) {
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

        return validateResult;
      },

      async afterResponse({ request, params, query, body, user, ip, set }) {
        const mixAuthConfig = getMixAuthConfigFromConfig(authConfig);

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
                  ? SystemOperationLogService.sanitizeData(query)
                  : undefined,
              params:
                params && Object.keys(params).length > 0
                  ? SystemOperationLogService.sanitizeData(params)
                  : undefined,
              body: body
                ? SystemOperationLogService.sanitizeData(body)
                : undefined,
            }
          : {};

        await SystemOperationLogService.createOperationLog({
          operatorId: user.id,
          operatorAccount: user.account,
          operatorName: user.realName,
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
