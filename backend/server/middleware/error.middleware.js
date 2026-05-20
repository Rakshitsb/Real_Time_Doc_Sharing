import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";
import logger from "../utils/logger.js";

const notFoundHandler = (req, res, next) => {
  next(new ApiError(HTTP_STATUS.NOT_FOUND, `Route not found: ${req.originalUrl}`));
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  if (statusCode >= 500) {
    logger.error(error.message || "Internal server error", {
      stack: error.stack,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?._id,
    });
  } else {
    logger.warn("api_warning", {
      message: error.message,
      method: req.method,
      path: req.originalUrl,
    });
  }

  res.status(statusCode).json({
    message: error.message || "Internal server error",
    success: false,
    ...(error.details ? { details: error.details } : {}),
  });
};

export { errorHandler, notFoundHandler };
