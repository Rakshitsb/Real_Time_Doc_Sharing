import asyncHandler from "../utils/asyncHandler.js";
import sendSuccess from "../utils/sendResponse.js";
import {
  getDocumentSharing,
  inviteCollaborator,
  removeCollaborator,
  searchCollaborators,
  updateCollaboratorRole,
  updateDocumentVisibility,
} from "../services/share.service.js";

const getSharing = asyncHandler(async (req, res) => {
  const sharing = await getDocumentSharing({ documentId: req.params.id, userId: req.user._id });
  sendSuccess(res, sharing);
});

const inviteUser = asyncHandler(async (req, res) => {
  const sharing = await inviteCollaborator({
    documentId: req.params.id,
    userId: req.user._id,
    io: req.app.get("io"),
    ...req.body,
  });
  sendSuccess(res, sharing);
});

const changeCollaboratorRole = asyncHandler(async (req, res) => {
  const sharing = await updateCollaboratorRole({
    documentId: req.params.id,
    collaboratorId: req.params.collaboratorId,
    userId: req.user._id,
    io: req.app.get("io"),
    ...req.body,
  });
  sendSuccess(res, sharing);
});

const deleteCollaborator = asyncHandler(async (req, res) => {
  const sharing = await removeCollaborator({
    documentId: req.params.id,
    collaboratorId: req.params.collaboratorId,
    userId: req.user._id,
    io: req.app.get("io"),
  });
  sendSuccess(res, sharing);
});

const changeVisibility = asyncHandler(async (req, res) => {
  const sharing = await updateDocumentVisibility({
    documentId: req.params.id,
    userId: req.user._id,
    ...req.body,
  });
  sendSuccess(res, sharing);
});

const searchUsers = asyncHandler(async (req, res) => {
  const users = await searchCollaborators({ query: req.query.q || "", userId: req.user._id });
  sendSuccess(res, users);
});

export { changeCollaboratorRole, changeVisibility, deleteCollaborator, getSharing, inviteUser, searchUsers };
