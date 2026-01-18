import { Queue } from "bullmq";
import { queueRedis } from "../lib/redis";

const QueueName = "mail";

export const mailQueue = new Queue(QueueName, {
  connection: queueRedis,
  prefix: [process.env.REDIS_PREFIX || "", "bullmq"]
    .filter((i) => !!i)
    .join(":"),
});
