export const BusinessErrorCode = {
  401: "未经授权的访问",
  403: "访问权限不足",
};

export class BusinessError extends Error {
  errCode: number;
  constructor(code: keyof typeof BusinessErrorCode) {
    super(BusinessErrorCode[code]);
    this.errCode = code;
  }
}
