import jwt from "jsonwebtoken";
import env from "../config/env.js";
import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * Authentication middleware.
 * 401 = no valid token (triggers auto-logout on the client).
 * 403 = authenticated but not permitted (used by resource-level guards).
 */
const ensureAuthenticated = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: "Unauthorized: token missing or malformed",
      success: false,
    });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: "Unauthorized: invalid or expired token",
      success: false,
    });
  }
};

export { ensureAuthenticated };
