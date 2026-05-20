import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { getAuthToken } from "../utils/storage";

const USER_STORAGE_KEY = "user";

/**
 * useAuthGuard — Multi-tab session synchronization.
 *
 * When localStorage is cleared in any browser tab (logout, session expiry),
 * all other open tabs automatically redirect to the login page.
 * This prevents stale "logged-in" UI in background tabs.
 */
const useAuthGuard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initial check — if there's no token when this mounts, redirect immediately
    if (!getAuthToken()) {
      navigate(ROUTES.LOGIN || "/login", { replace: true });
      return;
    }

    const handleStorageChange = (event) => {
      // Another tab cleared the user key → our token is gone
      if (event.key === USER_STORAGE_KEY && !event.newValue) {
        navigate(ROUTES.LOGIN || "/login", { replace: true });
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);
};

export default useAuthGuard;
