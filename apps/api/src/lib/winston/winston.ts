import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import { Format } from "logform";
import safeStringify from "fast-safe-stringify";
import { inspect } from "util";

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
  superSppName = "MyApp",
  options: ConsoleFormatOptions = {}
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
    ({ context, level, timestamp, message, ms, appName, ...meta }) => {
      let displayAppName = appName || superSppName;
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

      return (
        (displayAppName ? color(`[${displayAppName}]`) + " " : "") +
        (formatOptions.processId
          ? color(String(process.pid)).padEnd(6) + " "
          : "") +
        ("undefined" !== typeof timestamp ? `${timestamp} ` : "") +
        `${color(level.toUpperCase().padStart(7))} ` +
        ("undefined" !== typeof context
          ? `${yellow("[" + context + "]")}`
          : "") +
        ("undefined" !== typeof message ? ` ${color(message as string)}` : "") +
        (formattedMeta && formattedMeta !== "{}" ? ` - ${formattedMeta}` : "") +
        ("undefined" !== typeof ms ? ` ${yellow(ms as string)}` : "")
      );
    }
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
        })
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
          })
        ),
      })
    );
  }

  return winston.createLogger({
    transports,
  });
};

export const logger = getWinstonLogger();
