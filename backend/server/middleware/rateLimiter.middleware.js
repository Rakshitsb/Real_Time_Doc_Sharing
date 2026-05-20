import rateLimit from "express-rate-limit";

/**
 * Global rate limiter — applied to all API routes.
 * Prevents brute force and DoS attacks.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

/**
 * Strict limiter for authentication endpoints.
 * Prevents credential stuffing and brute force login attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  message: {
    success: false,
    message: "Too many login attempts. Please wait 15 minutes and try again.",
  },
});

export { authLimiter, globalLimiter };
