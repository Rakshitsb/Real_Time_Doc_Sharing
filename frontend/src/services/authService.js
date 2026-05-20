import API_ENDPOINTS from "../api/endpoints";
import apiClient from "../api/httpClient";

const login = async (credentials) => {
  const { data } = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  return data;
};

const register = async (payload) => {
  const { data } = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, payload);
  return data;
};

export { login, register };
