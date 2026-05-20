import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";
import User from "../models/User.model.js";
import { DOCUMENT_VISIBILITY } from "../constants/permissions.js";
import { ACTIVITY_TYPES, logActivity } from "./activity.service.js";
import { assertDocumentAccess, serializeDocumentAccess } from "./documentAccess.service.js";
import { createNotifications } from "./notification.service.js";

const userSelect = "name email";
const asId = (value) => String(value?._id || value);

const serializeSharing = (document, userId) => {
  const data = typeof document.toObject === "function" ? document.toObject() : document;
  return {
    _id: data._id,
    title: data.title,
    owner: data.owner,
    collaborators: data.collaborators || [],
    invitedUsers: data.invitedUsers || [],
    visibility: data.visibility || data.permissions?.visibility || DOCUMENT_VISIBILITY.PRIVATE,
    shareSettings: data.shareSettings || {},
    access: serializeDocumentAccess(data, userId),
  };
};

const getDocumentSharing = async ({ documentId, userId }) => {
  const { document } = await assertDocumentAccess({ documentId, userId, permission: "view" });
  return serializeSharing(document, userId);
};

const inviteCollaborator = async ({ documentId, userId, email, role, io }) => {
  const { document } = await assertDocumentAccess({ documentId, userId, permission: "share" });
  const invitee = await User.findOne({ email }).select(userSelect);

  if (!invitee) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "No user found with that email");
  }

  if (asId(invitee) === String(userId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You already own this document");
  }

  const existingIndex = document.collaborators.findIndex((item) => asId(item.user) === asId(invitee));
  if (existingIndex >= 0) {
    document.collaborators[existingIndex].role = role;
    document.collaborators[existingIndex].invitedBy = userId;
  } else {
    document.collaborators.push({
      user: invitee._id,
      role,
      invitedBy: userId,
      addedAt: new Date(),
    });
  }

  document.invitedUsers = [
    ...(document.invitedUsers || []).filter((item) => item.email !== email),
    { email, role, invitedBy: userId, invitedAt: new Date(), acceptedAt: new Date() },
  ];
  document.visibility = DOCUMENT_VISIBILITY.COLLABORATORS_ONLY;
  document.permissions.visibility = DOCUMENT_VISIBILITY.COLLABORATORS_ONLY;
  await document.save();
  await document.populate("owner", userSelect);
  await document.populate("collaborators.user", userSelect);
  await document.populate("collaborators.invitedBy", userSelect);

  await createNotifications({
    io,
    notifications: [
      {
        recipient: invitee._id,
        actor: userId,
        document: document._id,
        type: "document.invited",
        title: "You were invited to collaborate",
        body: `${role} access granted for ${document.title}`,
        sourceType: "document",
        sourceId: document._id,
      },
    ],
  });

  await logActivity({
    type: ACTIVITY_TYPES.COLLABORATOR_JOINED,
    document: document._id,
    actor: userId,
    metadata: { collaborator: invitee._id, role },
  });

  return serializeSharing(document, userId);
};

const updateCollaboratorRole = async ({ documentId, collaboratorId, userId, role, io }) => {
  if (!mongoose.Types.ObjectId.isValid(collaboratorId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid collaborator id");
  }

  const { document } = await assertDocumentAccess({ documentId, userId, permission: "share" });
  const collaborator = document.collaborators.find((item) => asId(item.user) === String(collaboratorId));
  if (!collaborator) throw new ApiError(HTTP_STATUS.NOT_FOUND, "Collaborator not found");

  collaborator.role = role;
  await document.save();
  await document.populate("owner", userSelect);
  await document.populate("collaborators.user", userSelect);
  await document.populate("collaborators.invitedBy", userSelect);

  await createNotifications({
    io,
    notifications: [
      {
        recipient: collaboratorId,
        actor: userId,
        document: document._id,
        type: "document.role_updated",
        title: "Document permission updated",
        body: `Your role is now ${role}`,
        sourceType: "document",
        sourceId: document._id,
      },
    ],
  });

  return serializeSharing(document, userId);
};

const removeCollaborator = async ({ documentId, collaboratorId, userId, io }) => {
  const { document } = await assertDocumentAccess({ documentId, userId, permission: "share" });
  const before = document.collaborators.length;
  document.collaborators = document.collaborators.filter((item) => asId(item.user) !== String(collaboratorId));
  if (document.collaborators.length === before) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Collaborator not found");
  }

  await document.save();
  await document.populate("owner", userSelect);
  await document.populate("collaborators.user", userSelect);
  await document.populate("collaborators.invitedBy", userSelect);

  await createNotifications({
    io,
    notifications: [
      {
        recipient: collaboratorId,
        actor: userId,
        document: document._id,
        type: "document.removed",
        title: "Document access removed",
        body: `You no longer have access to ${document.title}`,
        sourceType: "document",
        sourceId: document._id,
      },
    ],
  });

  await logActivity({
    type: ACTIVITY_TYPES.COLLABORATOR_REMOVED,
    document: document._id,
    actor: userId,
    metadata: { collaborator: collaboratorId },
  });

  return serializeSharing(document, userId);
};

const updateDocumentVisibility = async ({ documentId, userId, visibility }) => {
  const { document } = await assertDocumentAccess({ documentId, userId, permission: "share" });
  document.visibility = visibility;
  document.permissions.visibility = visibility;
  document.shareSettings.allowPublicRead = visibility === DOCUMENT_VISIBILITY.PUBLIC_READONLY;
  await document.save();
  await document.populate("owner", userSelect);
  await document.populate("collaborators.user", userSelect);
  await document.populate("collaborators.invitedBy", userSelect);
  return serializeSharing(document, userId);
};

const searchCollaborators = async ({ query = "", userId }) => {
  const term = query.trim();
  if (!term) return [];

  return User.find({
    _id: { $ne: userId },
    $or: [
      { name: { $regex: term, $options: "i" } },
      { email: { $regex: term, $options: "i" } },
    ],
  })
    .select(userSelect)
    .sort({ name: 1 })
    .limit(8)
    .lean();
};

export {
  getDocumentSharing,
  inviteCollaborator,
  removeCollaborator,
  searchCollaborators,
  updateCollaboratorRole,
  updateDocumentVisibility,
};
