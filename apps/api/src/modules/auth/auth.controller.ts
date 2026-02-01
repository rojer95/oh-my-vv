import {
  ADMIN_AUTH_ISSUER,
  BusinessErrorCode,
  ProfileType,
} from "@rojer/mf-common";
import { Elysia } from "elysia";
import type { StringValue } from "ms";

import { authPlugin } from "../../lib/auth";
import { BusinessError } from "../../lib/error";
import { CaptchaService } from "../helper/captcha.service";
import { SystemAccountService } from "../system-account/system-account.service";
import { SystemConfigService } from "../system-config/system-config.service";
import {
  BindUnBindMailDto,
  ChangePasswordDto,
  ForgetResetPasswordDto,
  ForgetSendCodeDto,
  LoginZod,
  SendMailCodeDto,
  TotpBindDto,
  TotpZod,
} from "./auth.dto";
import { AuthService } from "./auth.service";

export const authController = new Elysia()

  .use(authPlugin)

  .group("auth", (app) =>
    app
      /** 获取验证码状态 */
      .get("/captcha", async ({ ip }) => {
        return await AuthService.getCaptchaStatus(ip);
      })
      /** 生成图片验证码 */
      .post("/captcha", async () => {
        return await CaptchaService.image({
          width: 120,
          height: 38,
          ttl: 300,
        });
      })
      /** 根据账号获取totp状态 */
      .get(
        "/totp",
        async ({ query }) => {
          return await AuthService.getTotpStatusByAccount(query.account);
        },
        {
          query: TotpZod,
        },
      )
      /** 登录 */
      .post(
        "/login",
        async ({ body, ip, jwt }) => {
          const systemAccount = await AuthService.login(
            body.account,
            body.password,
            ip,
            body.id,
            body.code,
            body.totpToken,
          );

          const exp = await SystemConfigService.getValueByKey<StringValue>(
            "sys:login:exp",
            "string",
            "2d",
          );

          // 生成token
          const token = await jwt.sign(
            {
              userId: systemAccount.id,
            },
            ADMIN_AUTH_ISSUER,
            exp,
          );

          return { token };
        },
        {
          body: LoginZod,
        },
      )
      /** 忘记密码 - 发送验证码 */
      .post(
        "/forget/code",
        async ({ body }) => {
          return await AuthService.sendForgetCode(body.account);
        },
        { body: ForgetSendCodeDto },
      )
      /** 忘记密码 - 重制密码 */
      .post(
        "/forget/password",
        async ({ body }) => {
          return await AuthService.forgetResetPassword(
            body.account,
            body.code,
            body.password,
          );
        },
        { body: ForgetResetPasswordDto },
      )
      /** 获取个人信息 */
      .get(
        "/profile",
        async ({ user }) => {
          const account = await SystemAccountService.findOneWithSecretBy({
            id: user!.id,
          });

          const profile: ProfileType = {
            id: account.id,
            accountType: account.accountType,
            realName: account.realName,
            mail: account.mail,
            totp: !!account.totpSecret,
            permissions: await AuthService.getPermissionsByUser(account),
          };
          return profile;
        },
        { auth: true },
      )
      /** 绑定/解绑邮箱 - 发送验证码 */
      .post(
        "/mail",
        async ({ user, body }) => {
          const mail = user!.mail || body.mail;

          if (!mail)
            throw new BusinessError(BusinessErrorCode.AccountNotBindMain);

          return await AuthService.sendCodeToMail(
            user!.id!,
            mail,
            user?.mail ? "解绑邮箱" : "绑定邮箱",
          );
        },
        { auth: true, body: SendMailCodeDto },
      )
      /** 绑定/解绑邮箱 - 完成操作 */
      .put(
        "/mail",
        async ({ user, body }) => {
          const isUnBind = !!user!.mail;

          const targetMail = isUnBind ? "" : body.mail;

          return await AuthService.checkCodeAndChangeMail(
            user!.id!,
            isUnBind ? body.mail : targetMail,
            body.code,
            targetMail,
          );
        },
        { auth: true, body: BindUnBindMailDto },
      )
      /** 重置密码 */
      .put(
        "/password",
        async ({ user, body }) => {
          const accountId = user!.id!;

          const account = await SystemAccountService.findOneWithSecretBy({
            id: accountId,
          });

          const checkKey = AuthService.getAccountIdCheckKey(accountId);
          await AuthService.getAndCheckFailCount(checkKey);

          if (!AuthService.checkPassword(body.oldpassword, account.password)) {
            await AuthService.failOnce(checkKey);
            throw new BusinessError(BusinessErrorCode.AccountPasswordIncorrect);
          }

          return await AuthService.resetPassword(accountId, body.password);
        },
        { auth: true, body: ChangePasswordDto },
      )
      /** 绑定TOTP - 生成 */
      .post(
        "/totp",
        async () => {
          return await AuthService.generateTotp();
        },
        { auth: true },
      )
      /** 绑定TOTP - 绑定 */
      .put(
        "/totp",
        async ({ user, body }) => {
          const accountId = user!.id!;

          const account = await SystemAccountService.findOneWithSecretBy({
            id: accountId,
          });

          const isBind = !account.totpSecret;

          if (isBind) {
            if (!body.totpSecret)
              throw new BusinessError(BusinessErrorCode.TotpTokenIncorrect);

            return await AuthService.bindTotp(
              user!.id!,
              body.totpSecret,
              body.code,
            );
          } else {
            return await AuthService.unbindTotp(user!.id!, body.code);
          }
        },
        { auth: true, body: TotpBindDto },
      ),
  );
