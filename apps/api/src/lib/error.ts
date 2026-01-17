import Elysia, { status } from "elysia";
import { logger } from "./logger";

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

export const errorPlugin = new Elysia({ name: "lib_error" })
  .error({ BusinessError })
  .onError({ as: "global" }, ({ error, code }) => {
    switch (code) {
      case "BusinessError":
        return status(200, { code: error.errCode, message: error.message });

      case "NOT_FOUND":
        return status(200, { code: 404, message: code });

      case "VALIDATION":
        return status(200, { code: 400, message: error.customError });

      case "PARSE":
      case "INVALID_FILE_TYPE":
        return status(200, { code: 400, message: code });

      case "INTERNAL_SERVER_ERROR":
        return status(200, { code: 500, message: code });

      case "INVALID_COOKIE_SIGNATURE":
        return status(200, { code: 401, message: code });
    }

    logger.error(error);
    return status(200, { code: 500, message: (error as Error)?.message });
  });
