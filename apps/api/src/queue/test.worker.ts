// worker-thread.ts
import { Worker } from "bullmq";
import { logger } from "../lib/winston/winston";

const connection = {
  host: "localhost",
  port: 6379,
};

logger.info("🧵 Worker 线程已启动...", { context: "TestQueue" });

const worker = new Worker(
  "video-process",
  async (job) => {
    logger.info(`[Thread] 正在处理任务: ${job.id}`, { context: "TestQueue" });

    // 模拟重型计算（如视频转码）
    let count = 0;
    for (let i = 0; i < 1e8; i++) {
      count++;
    }

    logger.info(`[Thread] 任务 ${job.id} 处理完毕`, { context: "TestQueue" });
    return { result: "done" };
  },
  { connection }
);

// 监听错误防止线程静默崩溃
worker.on("error", (err) => {
  logger.error("Worker 线程出错:", err, { context: "TestQueue" });
});
