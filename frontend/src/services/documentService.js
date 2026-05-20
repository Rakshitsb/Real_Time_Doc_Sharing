import API_ENDPOINTS from "../api/endpoints";
import apiClient from "../api/httpClient";

const getDocuments = async () => {
  const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.BASE);
  return Array.isArray(data) ? data : data.data;
};

const getDocumentById = async (id) => {
  const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.BY_ID(id));
  return data;
};

const createDocument = async (documentData) => {
  const { data } = await apiClient.post(API_ENDPOINTS.DOCUMENTS.BASE, documentData);
  return data;
};

const updateDocument = async (id, documentData) => {
  const { data } = await apiClient.put(API_ENDPOINTS.DOCUMENTS.BY_ID(id), documentData);
  return data;
};

const deleteDocument = async (id) => {
  const { data } = await apiClient.delete(API_ENDPOINTS.DOCUMENTS.BY_ID(id));
  return data;
};

const getDocumentVersions = async (id) => {
  const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.VERSIONS(id));
  return data;
};

const getDocumentVersion = async (id, versionId) => {
  const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.VERSION_BY_ID(id, versionId));
  return data;
};

const restoreDocumentVersion = async (id, versionId) => {
  const { data } = await apiClient.post(API_ENDPOINTS.DOCUMENTS.RESTORE_VERSION(id, versionId));
  return data;
};

const getDocumentActivities = async (id) => {
  const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.ACTIVITIES(id));
  return data;
};

export {
  createDocument,
  deleteDocument,
  getDocumentActivities,
  getDocumentById,
  getDocumentVersion,
  getDocumentVersions,
  getDocuments,
  restoreDocumentVersion,
  updateDocument,
};
