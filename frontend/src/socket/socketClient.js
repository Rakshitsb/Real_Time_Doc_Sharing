import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { getAuthToken, clearCurrentUser } from "../utils/storage";

let socket;

/** Shared session-expiry handler — called by both HTTP interceptor and socket */
const onSessionExpired = () => {
  clearCurrentUser();

  toast.error("Your session has expired. Please log in again.", {
    id: "session-expired",
    duration: 4000,
  });

  setTimeout(() => {
    window.location.href = "/login";
  }, 500);
};

const getSocket = () => {
  const token = getAuthToken();

  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      autoConnect: false,
      auth: { token },
      // Prefer native WebSocket; fall back to polling only if needed
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 600,
      reconnectionDelayMax: 5000,
      // Keep-alive tuning
      pingTimeout: 20000,
      pingInterval: 25000,
    });

    // Server signals the token is invalid / expired
    socket.on("auth:expired", () => {
      disconnectSocket();
      onSessionExpired();
    });

    // Surface connection errors in dev
    socket.on("connect_error", (err) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("[socket] connect_error:", err.message);
      }
    });
  } else {
    socket.auth = { token };
  }

  return socket;
};

const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

/** Returns current socket connection status string */
const getSocketStatus = () => {
  if (!socket) return "disconnected";
  if (socket.connected) return "connected";
  return "connecting";
};

export { disconnectSocket, getSocket, getSocketStatus, onSessionExpired };
