import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@/asset",
        replacement: path.resolve(__dirname, "./src/asset"),
      },
      {
        find: "@/component",
        replacement: path.resolve(__dirname, "./src/component"),
      },
      {
        find: "@/exception",
        replacement: path.resolve(__dirname, "./src/exception"),
      },
      {
        find: "@/util",
        replacement: path.resolve(__dirname, "./src/util/index"),
      },
      {
        find: "@/hook",
        replacement: path.resolve(__dirname, "./src/hook"),
      },
      {
        find: "@/mobx",
        replacement: path.resolve(__dirname, "./src/mobx"),
      },
      {
        find: "@/schema",
        replacement: path.resolve(__dirname, "./src/schema"),
      },
      {
        find: "@/dayjs",
        replacement: path.resolve(__dirname, "./src/dayjs"),
      },
      {
        find: "@/api",
        replacement: path.resolve(__dirname, "./src/api"),
      },
      {
        find: "@/global.css",
        replacement: path.resolve(__dirname, "./src/global.css"),
      },
      {
        find: "@api",
        replacement: path.resolve(__dirname, "../../api/src"),
      },
    ],
  },
});
