import Elysia from "elysia";
import safeStringify from "fast-safe-stringify";
import { Format } from "logform";
import path from "path";
import { inspect } from "util";
import winston from "winston";
import "winston-daily-rotate-file";

const clc = {
  bold: (text: string) => `\x1B[1m${text}\x1B[0m`,
  green: (text: string) => `\x1B[32m${text}\x1B[39m`,
  yellow: (text: string) => `\x1B[33m${text}\x1B[39m`,
  red: (text: string) => `\x1B[31m${text}\x1B[39m`,
  magentaBright: (text: string) => `\x1B[95m${text}\x1B[39m`,
  cyanBright: (text: string) => `\x1B[96m${text}\x1B[39m`,
};

type ConsoleFormatOptions = {
  colors?: boolean;
  prettyPrint?: boolean;
  processId?: boolean;
  appName?: boolean;
};

const defaultOptions: ConsoleFormatOptions = {
  colors: !process.env.NO_COLOR,
  prettyPrint: true,
  processId: true,
  appName: true,
};

const ConsoleFormat = (
  appName = "MyApp",
  options: ConsoleFormatOptions = {},
): Format => {
  // Merge default options with user-provided options
  const formatOptions: ConsoleFormatOptions = {
    ...defaultOptions,
    ...options,
  };

  const ColorScheme: Record<string, (text: string) => string> = {
    log: clc.green,
    error: clc.red,
    warn: clc.yellow,
    debug: clc.magentaBright,
    verbose: clc.cyanBright,
  };

  return winston.format.printf(
    ({ context, level, timestamp, message, ms, ...meta }) => {
      if ("info" === level) {
        level = "log";
      }

      if ("undefined" !== typeof timestamp) {
        // Only format the timestamp to a locale representation if it's ISO 8601 format. Any format
        // that is not a valid date string will throw, just ignore it (it will be printed as-is).
        try {
          if (timestamp === new Date(timestamp as any).toISOString()) {
            timestamp = new Date(timestamp).toLocaleString();
          }
        } catch (error) {
          // eslint-disable-next-line no-empty
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const color =
        (formatOptions.colors && ColorScheme[level]) ||
        ((text: string): string => text);

      const yellow = formatOptions.colors
        ? clc.yellow
        : (text: string): string => text;

      const stringifiedMeta = safeStringify(meta);

      const formattedMeta = formatOptions.prettyPrint
        ? inspect(JSON.parse(stringifiedMeta), {
            colors: formatOptions.colors,
            depth: null,
          })
        : stringifiedMeta;

      // 1. 时间戳处理 (保持不变或略微简化)
      const formattedTimestamp = timestamp ? `${timestamp}` : "";

      // [AppName] 填充到 12 位
      const appPart = appName ? color(`[${appName}]`) : "";

      // PID 填充到 6 位
      const pidPart = formatOptions.processId ? color(String(process.pid)) : "";

      // Level 居中或左对齐 (LOG 为 3 位, ERROR 为 5 位, 取 5 位)
      const levelPart = color(level.toUpperCase().padEnd(5));

      // Context 模块名对齐
      const contextPart = context
        ? yellow(`[${context}]`.padEnd(14))
        : "".padEnd(14);

      // MS 耗时对齐
      const msPart = ms ? yellow(String(ms).padStart(7)) : "".padStart(7);

      return (
        `${appPart} ` +
        `${pidPart} ` +
        `${formattedTimestamp} ` +
        `${levelPart} ` +
        `${contextPart} ` +
        `${color(message as string)}` +
        (formattedMeta && formattedMeta !== "{}" ? ` - ${formattedMeta}` : "") +
        ` ${msPart}`
      );
    },
  );
};

const getWinstonLogger = () => {
  const transports: any[] = [
    new winston.transports.DailyRotateFile({
      filename: "log-%DATE%.log",
      dirname: path.join(process.cwd(), process.env.LOGGER_DIR || "logs"),
      level: "error",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.ms(),
        winston.format.splat(),
        winston.format.errors({ stack: true }),
        ConsoleFormat(process.env.APP_NAME || "MyApp", {
          colors: false,
          prettyPrint: true,
        }),
      ),
    }),
  ];

  if (process.env.NODE_ENV !== "production") {
    transports.push(
      new winston.transports.Console({
        level: "debug",
        format: winston.format.combine(
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          winston.format.ms(),
          winston.format.splat(),
          winston.format.errors({ stack: true }),
          ConsoleFormat(process.env.APP_NAME || "MyApp", {
            colors: true,
            prettyPrint: true,
          }),
        ),
      }),
    );
  }

  return winston.createLogger({
    transports,
  });
};

export const logger = getWinstonLogger();

export const loggerPlugin = () =>
  new Elysia({ name: "lib_logger" }).decorate("logger", logger);
