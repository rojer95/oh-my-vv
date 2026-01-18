import z from "zod";

export const LoginZod = z
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

export const TotpZod = z.object({
  account: z.string().min(1),
});

export const ForgetSendCodeDto = z.object({
  account: z.string().min(1),
});

export const ForgetResetPasswordDto = z.object({
  account: z.string().min(1),
  password: z.string().trim().min(1),
  code: z.string(),
});
