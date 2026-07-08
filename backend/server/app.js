import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import API_ROUTES from "./constants/routes.js";
import env from "./config/env.js";
import aiRouter from "./ai/routes/ai.routes.js";
import authRouter from "./routes/auth.routes.js";
import documentRouter from "./routes/document.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { globalLimiter, authLimiter } from "./middleware/rateLimiter.middleware.js";
import requestLogger from "./middleware/requestLogger.middleware.js";

const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.clientUrl,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ── Body parsing (with size limits to prevent payload attacks) ────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ── NoSQL injection prevention ────────────────────────────────────────────────
app.use(mongoSanitize());

// ── HTTP request logging ──────────────────────────────────────────────────────
app.use(requestLogger);

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use(API_ROUTES.API, globalLimiter);

// ── Health check (no auth, no rate limit) ────────────────────────────────────
app.get(API_ROUTES.HEALTH, (req, res) => {
  res.json({
    status: "ok",
    environment: env.nodeEnv,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memory: {
      heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use(API_ROUTES.AUTH, authLimiter, authRouter);
app.use(API_ROUTES.AI, aiRouter);
app.use(API_ROUTES.DOCUMENTS, documentRouter);
app.use(API_ROUTES.NOTIFICATIONS, notificationRouter);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
