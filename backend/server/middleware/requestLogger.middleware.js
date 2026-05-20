import morgan from "morgan";
import logger from "../utils/logger.js";

morgan.token("user", (req) => req.user?._id || "anonymous");

const stream = {
  write: (message) => logger.info("http_request", { message: message.trim() }),
};

const requestLogger = morgan(":method :url :status :res[content-length] - :response-time ms user=:user", {
  stream,
  skip: (req) => req.path === "/api/health",
});

export default requestLogger;
