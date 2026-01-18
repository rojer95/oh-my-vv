import { FULL_KEY_PERMISSION_TREE, ProfileType } from "@rojer/mf-common";
import { Elysia } from "elysia";
import { auth } from "./auth.plugin";
import { AuthService } from "./auth.service";
import { CaptchaService } from "./captcha.service";
import {
  ForgetResetPasswordDto,
  ForgetSendCodeDto,
  LoginZod,
  TotpZod,
} from "./auth.dto";

export const authController = new Elysia()

  .use(auth)

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
        async ({ body, ip, loginJwt }) => {
          const systemAccount = await AuthService.login(
            body.account,
            body.password,
            ip,
            body.id,
            body.code,
            body.totpToken,
          );

          // 生成token
          const token = await loginJwt.sign({
            uid: systemAccount.id,
            accountType: systemAccount.accountType,
            exp: "2d",
          });

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
          const profile: ProfileType = {
            id: user!.id,
            accountType: user!.accountType,
            realName: user!.realName,
            mail: user!.mail,
            totp: !!user!.totpSecret,
            permissions: await AuthService.getPermissionsByUser(user!),
          };
          return profile;
        },
        { auth: true },
      ),
  );
