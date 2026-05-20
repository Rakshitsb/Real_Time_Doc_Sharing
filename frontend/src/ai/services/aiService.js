import API_ENDPOINTS from "../../api/endpoints";
import apiClient from "../../api/httpClient";

const runAiAction = async (payload) => {
  const { data } = await apiClient.post(API_ENDPOINTS.AI.ACTIONS, payload);
  return data;
};

const askAiAssistant = async (payload) => {
  const { data } = await apiClient.post(API_ENDPOINTS.AI.CHAT, payload);
  return data;
};

export { askAiAssistant, runAiAction };
