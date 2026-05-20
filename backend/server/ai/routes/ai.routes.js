import express from "express";
import rateLimit from "express-rate-limit";
import env from "../../config/env.js";
import { ensureAuthenticated } from "../../middleware/auth.middleware.js";
import validateRequest from "../../middleware/validate.middleware.js";
import { aiActionSchema, aiChatSchema } from "../validators/ai.validator.js";
import { chatWithDocument, executeAiAction } from "../controllers/ai.controller.js";

const aiRouter = express.Router();

const aiRateLimiter = rateLimit({
  windowMs: env.aiRateLimitWindowMs,
  max: env.aiRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "AI usage limit reached. Please try again later.",
    success: false,
  },
});

aiRouter.use(ensureAuthenticated, aiRateLimiter);
aiRouter.post("/actions", validateRequest(aiActionSchema), executeAiAction);
aiRouter.post("/chat", validateRequest(aiChatSchema), chatWithDocument);

export default aiRouter;
