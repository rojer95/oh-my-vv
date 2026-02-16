import { Worker } from "bullmq";
import { BusinessError } from "../lib/error";
import { logger } from "../lib/logger";
import { bullMqConfig } from "../lib/redis";
import { MailService } from "../modules/mail/mail.service";

export type SendMailQueueArgs = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export const QueueName = "mail";
const LogName = "MailQueue";

const worker = new Worker<SendMailQueueArgs>(
  QueueName,
  async (job) => {
    try {
      if (job.name === "send") {
        logger.info(`发送邮件：${JSON.stringify(job.data)}`, {
          context: LogName,
        });
        await MailService.processSend(
          job.data.to,
          job.data.subject,
          job.data.text,
          job.data.html,
        );
      }
    } catch (error) {
      if (!(error instanceof BusinessError)) {
        logger.error("发送邮件失败", error);
        throw error;
      }
    }
  },
  {
    ...bullMqConfig,
    removeOnComplete: { count: 0 },
  },
);

worker.on("error", (err) => {
  logger.error("Worker 线程出错:", err, { context: QueueName });
});

logger.info("🧵 Worker 线程已启动...", { context: LogName });
