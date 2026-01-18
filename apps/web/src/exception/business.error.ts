/**
 * 业务错误
 */
export class BusinessError extends Error {
  code?: number;

  constructor(message?: string, code?: number, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
  }
}
