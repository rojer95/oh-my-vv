import { isPlainObject } from "lodash-es";
import { SystemOperationLog } from "../../entity/system-operation-log.entity";
import { logger } from "../../lib/logger";
import { AppDataSource } from "../../lib/typeorm";

export abstract class OperationLogService {
  static sanitizeData(data: any): any {
    if (!data || !isPlainObject(data)) return data;

    const sensitiveFields = [
      "password",
      "pwd",
      "secret",
      "token",
      "accessToken",
      "refreshToken",
    ];

    const sanitized = { ...data };

    for (const key in sanitized) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = "************";
      } else if (typeof sanitized[key] === "object") {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  static async createOperationLog(options: {
    operatorId: number;
    operatorAccount: string;
    operatorName: string;
    permissionKey: string;
    permissionName: string;
    method: string;
    path: string;
    ip: string;
    requestData: {
      query?: Record<string, any>;
      params?: Record<string, any>;
      body?: Record<string, any>;
    };
    success: boolean;
    errorMessage?: string;
  }): Promise<void> {
    try {
      const logRepository = AppDataSource.getRepository(SystemOperationLog);
      await logRepository.save({
        ...options,
        tenantId: 1,
      });

      logger.info("操作日志记录成功", {
        context: "OperationLog",
        operator: options.operatorAccount,
        permission: options.permissionKey,
        path: options.path,
        success: options.success,
      });
    } catch (error) {
      logger.error("操作日志记录失败", error, {
        context: "OperationLog",
      });
    }
  }
}
