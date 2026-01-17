import { SystemOperationLog } from "../entity/system-operation-log.entity";
import { AppDataSource } from "../lib/typeorm/db";
import { logger } from "../lib/winston/winston";

export async function createOperationLog(options: {
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
