import http from "http";
import app from "./server/app.js";
import connectDB from "./server/database/connection.js";
import env from "./server/config/env.js";
import initializeSocket from "./server/socket/index.js";
import logger from "./server/utils/logger.js";

const server = http.createServer(app);

await connectDB(env.mongoUri);

const io = initializeSocket(server);
app.set("io", io);

server.listen(env.port, () => {
  logger.info(`Server started`, { port: env.port, environment: env.nodeEnv });
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);

  server.close((err) => {
    if (err) {
      logger.error("Error during server shutdown", { error: err.message });
      process.exit(1);
    }

    logger.info("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason: String(reason) });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error: error.message, stack: error.stack });
  process.exit(1);
});

