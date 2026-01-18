import { FULL_KEY_PERMISSION_TREE, ProfileType } from "@rojer/mf-common";
import { Elysia } from "elysia";
import z from "zod";
import { auth } from "./auth.plugin";
import { AuthService } from "./auth.service";
import { CaptchaService } from "./captcha.service";

const LoginZod = z
  .object({
    account: z.string().min(1),
    password: z.string().trim().min(1),
    id: z.string().optional(),
    code: z.string().optional(),
    totpToken: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.id && !val.code) {
      ctx.addIssue({
        code: "custom",
        path: ["code"],
        message: "请输入验证码",
      });
    }
  });

const TotpZod = z.object({
  account: z.string().min(1),
});

const ForgetSendCodeDto = z.object({
  account: z.string().min(1),
});

const ForgetResetPasswordDto = z.object({
  account: z.string().min(1),
  password: z.string().trim().min(1),
  code: z.string(),
});

export const authController = new Elysia().use(auth).group("auth", (app) =>
  app
    .get("/permission/tree", () => FULL_KEY_PERMISSION_TREE)
    .get("/captcha", async ({ ip }) => {
      return await AuthService.getCaptchaStatus(ip);
    })
    .post("/captcha", async () => {
      return await CaptchaService.image({
        width: 120,
        height: 38,
        ttl: 300,
      });
    })
    .get(
      "/totp",
      async ({ query }) => {
        return await AuthService.getTotpStatusByAccount(query.account);
      },
      {
        query: TotpZod,
      },
    )
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
    .post(
      "/forget/code",
      async ({ body }) => {
        return await AuthService.sendForgetCode(body.account);
      },
      { body: ForgetSendCodeDto },
    )
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
