const API_ENDPOINTS = {
  AI: {
    ACTIONS: "/ai/actions",
    CHAT: "/ai/chat",
  },
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
  },
  DOCUMENTS: {
    BASE: "/documents",
    BY_ID: (id) => `/documents/${id}`,
    VERSIONS: (id) => `/documents/${id}/versions`,
    VERSION_BY_ID: (id, versionId) => `/documents/${id}/versions/${versionId}`,
    RESTORE_VERSION: (id, versionId) => `/documents/${id}/versions/${versionId}/restore`,
    ACTIVITIES: (id) => `/documents/${id}/activities`,
    CHAT: (id) => `/documents/${id}/chat`,
    COMMENTS: (id) => `/documents/${id}/comments`,
    COMMENT_REPLIES: (id, threadId) => `/documents/${id}/comments/${threadId}/replies`,
    COMMENT_RESOLVE: (id, threadId) => `/documents/${id}/comments/${threadId}/resolve`,
    COMMENT_REOPEN: (id, threadId) => `/documents/${id}/comments/${threadId}/reopen`,
    MENTION_SEARCH: (id) => `/documents/${id}/mentions/search`,
    SHARING: (id) => `/documents/${id}/sharing`,
    SHARING_USER_SEARCH: (id) => `/documents/${id}/sharing/users/search`,
    INVITE: (id) => `/documents/${id}/sharing/invite`,
    VISIBILITY: (id) => `/documents/${id}/sharing/visibility`,
    COLLABORATOR: (id, collaboratorId) => `/documents/${id}/collaborators/${collaboratorId}`,
  },
  NOTIFICATIONS: {
    BASE: "/notifications",
    READ: "/notifications/read",
  },
};

export default API_ENDPOINTS;
