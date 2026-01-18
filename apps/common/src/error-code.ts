export const BusinessErrorCode = {
  Unauthorized: [401, "未经授权的访问"],
  Forbidden: [403, "访问权限不足"],
  PasswordTooSimple: [10001, "密码太简单"],
  TryLater: [10002, "操作过于频繁，请{{t}}后再试"],
  LackCaptchaCode: [10003, "请输入验证码"],
  LoginFail: [10004, "账号不存在/密码错误，您还有{{t}}次机会"],
  AccountBan: [10005, "您已经被禁止使用"],
  LackTotp: [10006, "请输入多重验证验证码"],
  TotpTokenError: [10007, "多重验证验证码错误，您还有{{t}}次机会"],
  CaptchaCodeError: [10008, "验证验证码错误"],
  AccountNotBindMain: [10009, "该账号还未绑定邮箱"],
} as const;
