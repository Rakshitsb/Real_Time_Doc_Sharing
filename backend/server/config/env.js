import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [];

const getEnv = (key, fallback) => {
  const value = process.env[key] || fallback;

  if (!value) {
    requiredEnv.push(key);
  }

  return value;
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT) || 5000,
  mongoUri: getEnv("MONGO_URI", "mongodb+srv://rakshit123:rakshit123@rakshitcluster.dqxariv.mongodb.net/EyInternship"),
  jwtSecret: getEnv("JWT_SECRET", "Rakshitb"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 300,
  socketMaxHttpBufferSize: Number(process.env.SOCKET_MAX_HTTP_BUFFER_SIZE) || 1e6,
  aiProvider: process.env.AI_PROVIDER || "groq",
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqBaseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS) || 25000,
  aiRateLimitWindowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  aiRateLimitMax: Number(process.env.AI_RATE_LIMIT_MAX) || 40,
};

if (requiredEnv.length > 0) {
  throw new Error(`Missing required environment variables: ${requiredEnv.join(", ")}`);
}

if (env.isProduction && env.jwtSecret === "Rakshitb") {
  throw new Error("JWT_SECRET must be configured in production");
}

if (env.isProduction && env.clientUrl.includes("localhost")) {
  throw new Error("CLIENT_URL must be configured to the deployed frontend in production");
}

export default env;
