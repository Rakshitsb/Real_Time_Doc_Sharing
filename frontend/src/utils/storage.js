const USER_STORAGE_KEY = "user";

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
  } catch {
    return null;
  }
};

const getAuthToken = () => getCurrentUser()?.token || null;

const setCurrentUser = (user) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const clearCurrentUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

export { clearCurrentUser, getAuthToken, getCurrentUser, setCurrentUser };
