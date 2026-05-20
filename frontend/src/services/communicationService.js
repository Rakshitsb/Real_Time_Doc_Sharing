import API_ENDPOINTS from "../api/endpoints";
import apiClient from "../api/httpClient";

const unwrap = ({ data }) => data;

const getChatMessages = async (documentId, params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.CHAT(documentId), { params });
  return unwrap(response);
};

const sendChatMessage = async (documentId, payload) => {
  const response = await apiClient.post(API_ENDPOINTS.DOCUMENTS.CHAT(documentId), payload);
  return unwrap(response);
};

const getCommentThreads = async (documentId, params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.COMMENTS(documentId), { params });
  return unwrap(response);
};

const createCommentThread = async (documentId, payload) => {
  const response = await apiClient.post(API_ENDPOINTS.DOCUMENTS.COMMENTS(documentId), payload);
  return unwrap(response);
};

const createCommentReply = async (documentId, threadId, payload) => {
  const response = await apiClient.post(API_ENDPOINTS.DOCUMENTS.COMMENT_REPLIES(documentId, threadId), payload);
  return unwrap(response);
};

const resolveCommentThread = async (documentId, threadId) => {
  const response = await apiClient.post(API_ENDPOINTS.DOCUMENTS.COMMENT_RESOLVE(documentId, threadId));
  return unwrap(response);
};

const reopenCommentThread = async (documentId, threadId) => {
  const response = await apiClient.post(API_ENDPOINTS.DOCUMENTS.COMMENT_REOPEN(documentId, threadId));
  return unwrap(response);
};

const searchMentionableUsers = async (documentId, q) => {
  const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.MENTION_SEARCH(documentId), { params: { q } });
  return unwrap(response);
};

const getNotifications = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BASE, { params });
  return unwrap(response);
};

const markNotificationsRead = async (notificationIds = []) => {
  const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.READ, { notificationIds });
  return unwrap(response);
};

export {
  createCommentReply,
  createCommentThread,
  getChatMessages,
  getCommentThreads,
  getNotifications,
  markNotificationsRead,
  reopenCommentThread,
  resolveCommentThread,
  searchMentionableUsers,
  sendChatMessage,
};
