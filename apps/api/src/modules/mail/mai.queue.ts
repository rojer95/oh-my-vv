import { Queue } from "bullmq";
import { bullMqConfig } from "../../lib/redis";
import { QueueName, SendMailQueueArgs } from "../../worker/mail.worker";

export const mailQueue = new Queue<SendMailQueueArgs>(QueueName, {
  ...bullMqConfig,
});
