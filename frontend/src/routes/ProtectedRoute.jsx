import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { getAuthToken } from "../utils/storage";
import useAuthGuard from "../hooks/useAuthGuard";

/**
 * ProtectedRoute — Guards all authenticated routes.
 * - Redirects to home if no token present at render time.
 * - Activates useAuthGuard for multi-tab session synchronization.
 * - Auto-logout is handled globally in httpClient.js (401 interceptor).
 */
const ProtectedRoute = () => {
  // Multi-tab logout sync — also validates token on mount
  useAuthGuard();

  return getAuthToken() ? <Outlet /> : <Navigate to={ROUTES.HOME} replace />;
};

export default ProtectedRoute;
