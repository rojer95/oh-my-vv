import Elysia from "elysia";

export const bullmqPlugin = ({ workers }: { workers: string[] }) =>
  new Elysia({ name: "lib_bullmq" }).onStart(() => {
    for (const worker of workers) {
      new Worker(
        new URL(`../worker/${worker}.worker.ts`, import.meta.url).href,
      );
    }
  });
