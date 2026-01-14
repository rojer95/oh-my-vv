import Elysia, { status } from "elysia";
import { BusinessError } from "./business.error";
import { logger } from "../winston/winston";

export const error = new Elysia()
  .error({ BusinessError })
  .onError({ as: "global" }, ({ error, code }) => {
    switch (code) {
      case "BusinessError":
        return status(200, { code: error.code, message: error.message });

      case "NOT_FOUND":
        return status(200, { code: 404, message: code });

      case "VALIDATION":
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
