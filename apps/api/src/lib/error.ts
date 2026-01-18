import Elysia, { status } from "elysia";
import { logger } from "./logger";

export class BusinessError extends Error {
  errCode: number;
  args?: any;
  constructor(code: readonly [number, string], args?: any) {
    super(code[1]);
    this.errCode = code[0];
    this.args = args;
  }

  getMessage(): string {
    if (!this.args) return this.message || "";

    let result = this.message || "";
    for (const [key, value] of Object.entries(this.args)) {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    }
    return result;
  }
}

export const errorPlugin = () =>
  new Elysia({ name: "lib_error" })
    .error({ BusinessError })
    .onError({ as: "global" }, ({ error, code }) => {
      switch (code) {
        case "BusinessError":
          return status(200, {
            code: error.errCode,
            message: error.getMessage(),
          });

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
