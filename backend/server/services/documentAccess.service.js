import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";
import { DOCUMENT_ROLES, canRoleComment, canRoleEdit, canRoleShare, canRoleView } from "../constants/permissions.js";
import { findDocumentById } from "../repositories/document.repository.js";

const asId = (value) => String(value?._id || value);

const getDocumentRole = (document, userId) => {
  const id = String(userId);
  if (asId(document.owner) === id) return DOCUMENT_ROLES.OWNER;

  const collaborator = (document.collaborators || []).find((item) => asId(item.user) === id);
  if (collaborator?.role) return collaborator.role;

  if (document.visibility === "public-readonly" || document.permissions?.visibility === "public-readonly") {
    return DOCUMENT_ROLES.VIEWER;
  }

  return null;
};

const assertDocumentAccess = async ({ documentId, userId, permission = "view" }) => {
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid document id");
  }

  const document = await findDocumentById({ documentId, lean: false });
  if (!document) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Document not found");
  }

  const role = getDocumentRole(document, userId);
  const allowed =
    permission === "share"
      ? canRoleShare(role)
      : permission === "comment"
        ? canRoleComment(role)
      : permission === "edit"
        ? canRoleEdit(role)
        : canRoleView(role);

  if (!allowed) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "You do not have permission for this document");
  }

  return { document, role };
};

const serializeDocumentAccess = (document, userId) => {
  const role = getDocumentRole(document, userId);
  return {
    role,
    canView: canRoleView(role),
    canComment: canRoleComment(role),
    canEdit: canRoleEdit(role),
    canShare: canRoleShare(role),
  };
};

export { assertDocumentAccess, getDocumentRole, serializeDocumentAccess };
