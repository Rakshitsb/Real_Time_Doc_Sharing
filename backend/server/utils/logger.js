import winston from "winston";

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const isDev = process.env.NODE_ENV !== "production";

/**
 * Sensitive key redaction — strips secrets from logged metadata.
 */
const redactFormat = winston.format((info) => {
  const sensitiveKeys = /token|password|secret|authorization/i;

  if (info.metadata && typeof info.metadata === "object") {
    info.metadata = Object.fromEntries(
      Object.entries(info.metadata).map(([k, v]) => [
        k,
        sensitiveKeys.test(k) ? "[redacted]" : v,
      ])
    );
  }

  return info;
});

/**
 * Structured logger using Winston.
 *
 * Development: human-readable colorized console output
 * Production:  JSON structured logs (suitable for Datadog, Loki, Sentry, etc.)
 */
const devFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${ts} [${level}]: ${stack || message}${metaStr}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  format: combine(
    redactFormat(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true })
  ),
  transports: isDev
    ? [
        new winston.transports.Console({
          format: combine(colorize(), devFormat),
        }),
      ]
    : [
        new winston.transports.Console({
          format: combine(json()),
        }),
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
          maxsize: 5 * 1024 * 1024,
          maxFiles: 5,
          format: combine(json()),
        }),
        new winston.transports.File({
          filename: "logs/combined.log",
          maxsize: 10 * 1024 * 1024,
          maxFiles: 5,
          format: combine(json()),
        }),
      ],
});

export default logger;
