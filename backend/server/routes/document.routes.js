import express from "express";
import {
  addChatMessage,
  addCommentReply,
  addCommentThread,
  listChatMessages,
  listCommentThreads,
  reopenCommentThread,
  resolveCommentThread,
  searchMentions,
} from "../controllers/communication.controller.js";
import {
  changeCollaboratorRole,
  changeVisibility,
  deleteCollaborator,
  getSharing,
  inviteUser,
  searchUsers,
} from "../controllers/share.controller.js";
import {
  addDocument,
  editDocument,
  getDocument,
  getVersion,
  listDocumentActivities,
  listDocumentVersions,
  listDocuments,
  removeDocument,
  restoreVersion,
} from "../controllers/document.controller.js";
import { ensureAuthenticated } from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import { documentSchema } from "../validators/document.validator.js";
import {
  inviteCollaboratorSchema,
  updateCollaboratorRoleSchema,
  updateVisibilitySchema,
} from "../validators/share.validator.js";

const documentRouter = express.Router();

documentRouter.use(ensureAuthenticated);

documentRouter.get("/", listDocuments);
documentRouter.get("/:id/versions", listDocumentVersions);
documentRouter.get("/:id/versions/:versionId", getVersion);
documentRouter.post("/:id/versions/:versionId/restore", restoreVersion);
documentRouter.get("/:id/activities", listDocumentActivities);
documentRouter.get("/:id/chat", listChatMessages);
documentRouter.post("/:id/chat", addChatMessage);
documentRouter.get("/:id/comments", listCommentThreads);
documentRouter.post("/:id/comments", addCommentThread);
documentRouter.post("/:id/comments/:threadId/replies", addCommentReply);
documentRouter.post("/:id/comments/:threadId/resolve", resolveCommentThread);
documentRouter.post("/:id/comments/:threadId/reopen", reopenCommentThread);
documentRouter.get("/:id/mentions/search", searchMentions);
documentRouter.get("/:id/sharing", getSharing);
documentRouter.get("/:id/sharing/users/search", searchUsers);
documentRouter.post("/:id/sharing/invite", validateRequest(inviteCollaboratorSchema), inviteUser);
documentRouter.patch("/:id/sharing/visibility", validateRequest(updateVisibilitySchema), changeVisibility);
documentRouter.patch("/:id/collaborators/:collaboratorId", validateRequest(updateCollaboratorRoleSchema), changeCollaboratorRole);
documentRouter.delete("/:id/collaborators/:collaboratorId", deleteCollaborator);
documentRouter.get("/:id", getDocument);
documentRouter.post("/", validateRequest(documentSchema), addDocument);
documentRouter.put("/:id", validateRequest(documentSchema), editDocument);
documentRouter.delete("/:id", removeDocument);

export default documentRouter;
