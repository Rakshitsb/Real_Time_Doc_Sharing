import API_ENDPOINTS from "../api/endpoints";
import apiClient from "../api/httpClient";

const getDocumentSharing = async (documentId) => {
  const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.SHARING(documentId));
  return data;
};

const searchShareUsers = async (documentId, query) => {
  const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.SHARING_USER_SEARCH(documentId), {
    params: { q: query },
  });
  return data;
};

const inviteCollaborator = async (documentId, payload) => {
  const { data } = await apiClient.post(API_ENDPOINTS.DOCUMENTS.INVITE(documentId), payload);
  return data;
};

const updateCollaboratorRole = async (documentId, collaboratorId, role) => {
  const { data } = await apiClient.patch(API_ENDPOINTS.DOCUMENTS.COLLABORATOR(documentId, collaboratorId), { role });
  return data;
};

const removeCollaborator = async (documentId, collaboratorId) => {
  const { data } = await apiClient.delete(API_ENDPOINTS.DOCUMENTS.COLLABORATOR(documentId, collaboratorId));
  return data;
};

const updateDocumentVisibility = async (documentId, visibility) => {
  const { data } = await apiClient.patch(API_ENDPOINTS.DOCUMENTS.VISIBILITY(documentId), { visibility });
  return data;
};

export {
  getDocumentSharing,
  inviteCollaborator,
  removeCollaborator,
  searchShareUsers,
  updateCollaboratorRole,
  updateDocumentVisibility,
};
