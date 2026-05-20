import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";
import {
  countVersionsByDocument,
  createDocumentVersion,
  findVersionById,
  findVersionsByDocument,
  getNextVersionNumber,
} from "../repositories/documentVersion.repository.js";
import { updateDocumentById } from "../repositories/document.repository.js";
import { normalizeEditorContent } from "./editor.service.js";
import { logActivity, ACTIVITY_TYPES } from "./activity.service.js";
import { createContentHash, getContentSizeBytes } from "../utils/contentHash.js";
import {
  DEFAULT_VERSION_LIMIT,
  MAX_VERSION_LIMIT,
  VERSION_SNAPSHOT_INTERVAL_MS,
} from "../constants/versioning.js";
import { buildPaginatedResult, getPagination } from "../utils/pagination.js";

const shouldCreateSnapshot = ({ document, nextContentHash, force = false }) => {
  if (force) return true;
  if (!document.metadata?.contentHash) return true;
  if (document.metadata.contentHash === nextContentHash) return false;
  if (!document.metadata?.lastVersionAt) return true;

  return Date.now() - new Date(document.metadata.lastVersionAt).getTime() >= VERSION_SNAPSHOT_INTERVAL_MS;
};

const createVersionSnapshot = async ({
  document,
  userId,
  reason = "auto",
  summary = "",
  force = false,
}) => {
  const normalizedContent = normalizeEditorContent(document.content);
  const contentHash = createContentHash(normalizedContent);

  if (!shouldCreateSnapshot({ document, nextContentHash: contentHash, force })) {
    return null;
  }

  const versionNumber = await getNextVersionNumber(document._id);
  const version = await createDocumentVersion({
    document: document._id,
    versionNumber,
    title: document.title,
    content: normalizedContent,
    contentHash,
    createdBy: userId,
    reason,
    summary,
    metadata: {
      sizeBytes: getContentSizeBytes(normalizedContent),
    },
  });

  await updateDocumentById({
    documentId: document._id,
    payload: {
      "metadata.lastVersionAt": new Date(),
      "metadata.versionCount": versionNumber,
      "metadata.contentHash": contentHash,
    },
  });

  await logActivity({
    type: ACTIVITY_TYPES.VERSION_CREATED,
    document: document._id,
    actor: userId,
    metadata: { versionId: version._id, versionNumber, reason },
  });

  return version;
};

const getDocumentVersions = async ({ documentId, query }) => {
  const { page, limit, skip } = getPagination({
    page: query.page,
    limit: query.limit || DEFAULT_VERSION_LIMIT,
    maxLimit: MAX_VERSION_LIMIT,
  });

  const [data, total] = await Promise.all([
    findVersionsByDocument({ documentId, skip, limit }),
    countVersionsByDocument(documentId),
  ]);

  return buildPaginatedResult({ data, total, page, limit });
};

const getDocumentVersion = async ({ documentId, versionId }) => {
  if (!mongoose.Types.ObjectId.isValid(versionId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid version id");
  }

  const version = await findVersionById({ documentId, versionId });

  if (!version) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Document version not found");
  }

  return version;
};

const restoreDocumentVersion = async ({ document, versionId, userId }) => {
  const version = await getDocumentVersion({ documentId: document._id, versionId });

  await createVersionSnapshot({
    document,
    userId,
    reason: "pre_restore",
    summary: `Snapshot before restoring version ${version.versionNumber}`,
    force: true,
  });

  const restoredContent = normalizeEditorContent(version.content);
  const restoredHash = createContentHash(restoredContent);
  const restoredDocument = await updateDocumentById({
    documentId: document._id,
    payload: {
      title: version.title,
      content: restoredContent,
      "metadata.lastEditedBy": userId,
      "metadata.lastEditedAt": new Date(),
      "metadata.contentHash": restoredHash,
    },
  });

  await createVersionSnapshot({
    document: restoredDocument,
    userId,
    reason: "restore",
    summary: `Restored from version ${version.versionNumber}`,
    force: true,
  });

  await logActivity({
    type: ACTIVITY_TYPES.VERSION_RESTORED,
    document: document._id,
    actor: userId,
    metadata: {
      restoredVersionId: version._id,
      restoredVersionNumber: version.versionNumber,
    },
  });

  return restoredDocument;
};

export {
  createVersionSnapshot,
  getDocumentVersion,
  getDocumentVersions,
  restoreDocumentVersion,
};
