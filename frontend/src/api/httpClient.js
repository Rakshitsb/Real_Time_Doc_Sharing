import axios from "axios";
import toast from "react-hot-toast";
import { getAuthToken, clearCurrentUser } from "../utils/storage";
import { disconnectSocket } from "../socket/socketClient";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request: attach JWT ──────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── Response: handle errors ──────────────────────────────────────────────────

/** Auth endpoints that should NEVER trigger auto-logout redirect */
const AUTH_PATHS = ["/auth/login", "/auth/register"];

let isLoggingOut = false;

const handleSessionExpired = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  clearCurrentUser();
  disconnectSocket();

  toast.error("Your session has expired. Please log in again.", {
    id: "session-expired",
    duration: 4000,
  });

  // Small delay so the toast is visible before navigation
  setTimeout(() => {
    isLoggingOut = false;
    window.location.href = "/login";
  }, 500);
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const status = error.response?.status;
    const requestUrl = config?.url || "";

    // Auto-logout on 401 (expired / invalid token) — skip auth endpoints
    if (status === 401 && !AUTH_PATHS.some((path) => requestUrl.includes(path))) {
      handleSessionExpired();
      return Promise.reject(error);
    }

    // Retry idempotent GET/HEAD requests once on 5xx network errors
    const canRetry =
      config &&
      !config.__retried &&
      (!error.response || error.response.status >= 500) &&
      ["get", "head"].includes((config.method || "get").toLowerCase());

    if (canRetry) {
      config.__retried = true;
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      return apiClient(config);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
