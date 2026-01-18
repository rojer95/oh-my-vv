import { Worker } from "bullmq";
import { logger } from "../lib/logger";
import { queueRedis } from "../lib/redis";

const QueueName = "mail";
const LogName = "MailQueue";

const worker = new Worker(
  QueueName,
  async (job) => {
    logger.info(`[Thread] 正在处理任务: ${job.id}`, {
      context: LogName,
    });

    if (job.name === "send") {
      logger.info(`发送邮件：${JSON.stringify(job.data)}`, {
        context: LogName,
      });
    }

    logger.info(`[Thread] 任务 ${job.id} 处理完毕`, {
      context: LogName,
    });
  },
  {
    connection: queueRedis,
    prefix: [process.env.REDIS_PREFIX || "", "bullmq"]
      .filter((i) => !!i)
      .join(":"),
    removeOnComplete: { count: 0 },
  },
);

worker.on("error", (err) => {
  logger.error("Worker 线程出错:", err, { context: QueueName });
});

logger.info("🧵 Worker 线程已启动...", { context: LogName });
