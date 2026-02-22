import Elysia, { status } from "elysia";
import { logger } from "./logger";
import z, { ZodError } from "zod";

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
    .onError({ as: "global" }, ({ error, code, set }) => {
      let message: string = String(code);
      let res;

      switch (code) {
        case "BusinessError":
          message = error.getMessage();
          res = status(200, {
            code: error.errCode,
            message: error.getMessage(),
          });
          break;

        case "NOT_FOUND":
          res = status(200, { code: 404, message: code });
          break;

        case "VALIDATION":
          res = status(200, {
            code: 400,
            message: error.valueError
              ? z.prettifyError({ issues: [error.valueError as any] })
              : error.customError,
          });
          break;

        case "PARSE":
        case "INVALID_FILE_TYPE":
          res = status(200, { code: 400, message: code });
          break;

        case "INTERNAL_SERVER_ERROR":
          res = status(200, { code: 500, message: code });
          break;

        case "INVALID_COOKIE_SIGNATURE":
          res = status(200, { code: 401, message: code });
          break;

        default:
          logger.error("未知错误", error);
          res = status(200, { code: 500, message: (error as Error)?.message });
          break;
      }

      set.headers["x-error-signal"] = encodeURIComponent(message);
      return res;
    });
