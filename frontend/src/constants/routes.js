const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  NEW_DOCUMENT: "/document/new",
  DOCUMENT_DETAILS: "/document/:id",
};

const getDocumentPath = (id) => `/document/${id}`;

export { getDocumentPath, ROUTES };
