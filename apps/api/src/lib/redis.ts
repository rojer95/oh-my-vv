import { Redis, RedisOptions } from "ioredis";

export const redisConnection: RedisOptions = {
  name: "mf:common",
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  db: Number(process.env.REDIS_DB),
  keyPrefix: [process.env.REDIS_PREFIX || ""].filter((i) => !!i).join(":"),
};

export const redis = new Redis(redisConnection);

export const redisQueueConnection: RedisOptions = {
  name: "mf:queue",
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  db: Number(process.env.REDIS_DB),
  maxRetriesPerRequest: null,
};

const queueRedis = new Redis(redisQueueConnection);

export const bullMqConfig = {
  connection: queueRedis,
  prefix: [process.env.REDIS_PREFIX || "", "bullmq"]
    .filter((i) => !!i)
    .join(":"),
};
