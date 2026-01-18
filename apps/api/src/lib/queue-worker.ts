import Elysia from "elysia";
import { logger } from "./logger";

export const queueWorkerPlugin = ({ workers }: { workers: string[] }) =>
  new Elysia({ name: "lib_queue" }).onStart(() => {
    for (const worker of workers) {
      new Worker(
        new URL(`../worker/${worker}.worker.ts`, import.meta.url).href,
      );
    }
  });
