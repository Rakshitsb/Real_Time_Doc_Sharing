import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import env from "../config/env.js";

const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again shortly",
    success: false,
  },
});

const applySecurityMiddleware = (app) => {
  app.disable("x-powered-by");
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(compression());
  app.use(mongoSanitize());
  app.use(apiRateLimiter);
};

export { apiRateLimiter, applySecurityMiddleware };
