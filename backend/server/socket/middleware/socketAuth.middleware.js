import jwt from "jsonwebtoken";
import env from "../../config/env.js";

const SOCKET_AUTH_EVENTS = {
  AUTH_EXPIRED: "auth:expired",
};

/**
 * Socket.IO authentication middleware.
 * Verifies the JWT from the handshake auth or Authorization header.
 * Emits `auth:expired` before disconnecting so the client can auto-logout.
 */
const socketAuthMiddleware = (socket, next) => {
  const authToken = socket.handshake.auth?.token;
  const authHeader = socket.handshake.headers?.authorization;
  const token = authToken || authHeader?.replace("Bearer ", "");

  if (!token) {
    next(new Error("Socket authentication token is required"));
    return;
  }

  try {
    socket.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch (error) {
    // Emit auth:expired so the client socket listener can trigger auto-logout
    socket.emit(SOCKET_AUTH_EVENTS.AUTH_EXPIRED, {
      message: "Your session has expired. Please log in again.",
    });
    next(new Error("Invalid or expired socket authentication token"));
  }
};

export default socketAuthMiddleware;
