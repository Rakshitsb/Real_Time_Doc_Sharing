const DOCUMENT_ROLES = {
  OWNER: "owner",
  EDITOR: "editor",
  VIEWER: "viewer",
  COMMENTER: "commenter",
};

const DOCUMENT_VISIBILITY = {
  PRIVATE: "private",
  COLLABORATORS_ONLY: "collaborators-only",
  PUBLIC_READONLY: "public-readonly",
};

const ROLE_RANK = {
  [DOCUMENT_ROLES.VIEWER]: 1,
  [DOCUMENT_ROLES.COMMENTER]: 2,
  [DOCUMENT_ROLES.EDITOR]: 3,
  [DOCUMENT_ROLES.OWNER]: 4,
};

const canRoleEdit = (role) => ROLE_RANK[role] >= ROLE_RANK[DOCUMENT_ROLES.EDITOR];
const canRoleComment = (role) => ROLE_RANK[role] >= ROLE_RANK[DOCUMENT_ROLES.COMMENTER];
const canRoleShare = (role) => role === DOCUMENT_ROLES.OWNER;
const canRoleView = (role) => Boolean(ROLE_RANK[role]);

export { DOCUMENT_ROLES, DOCUMENT_VISIBILITY, canRoleComment, canRoleEdit, canRoleShare, canRoleView };
