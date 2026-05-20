import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";
import { normalizeEditorContent } from "./editor.service.js";
import {
  countAccessibleDocuments,
  createDocumentRecord,
  findAccessibleDocumentById,
  findAccessibleDocuments,
  softDeleteDocumentById,
  updateDocumentById,
} from "../repositories/document.repository.js";
import { buildPaginatedResult, getPagination } from "../utils/pagination.js";
import { createContentHash } from "../utils/contentHash.js";
import { createVersionSnapshot } from "./documentVersion.service.js";
import { logActivity, ACTIVITY_TYPES } from "./activity.service.js";
import { assertDocumentAccess, serializeDocumentAccess } from "./documentAccess.service.js";

const assertValidObjectId = (id, label = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Invalid ${label}`);
  }
};

const getDocuments = async ({ userId, query = {} }) => {
  const { page, limit, skip } = getPagination({
    page: query.page,
    limit: query.limit,
  });

  const [data, total] = await Promise.all([
    findAccessibleDocuments({ userId, skip, limit }),
    countAccessibleDocuments(userId),
  ]);

  return buildPaginatedResult({
    data: data.map((document) => ({
      ...document,
      access: serializeDocumentAccess(document, userId),
    })),
    total,
    page,
    limit,
  });
};

const getDocumentById = async ({ id, userId, lean = false }) => {
  assertValidObjectId(id, "document id");

  const document = await findAccessibleDocumentById({
    documentId: id,
    userId,
    lean,
  });

  if (!document) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Document not found");
  }

  if (lean) {
    return {
      ...document,
      access: serializeDocumentAccess(document, userId),
    };
  }

  const data = document.toObject();
  document.set("access", serializeDocumentAccess(data, userId), { strict: false });
  return document;
};

const createDocument = async ({ title, content }, userId) => {
  const normalizedContent = normalizeEditorContent(content);
  const document = await createDocumentRecord({
    title,
    content: normalizedContent,
    owner: userId,
    visibility: "private",
    permissions: {
      visibility: "private",
      allowRestore: true,
    },
    metadata: {
      lastEditedBy: userId,
      lastEditedAt: new Date(),
      contentHash: createContentHash(normalizedContent),
    },
  });

  await createVersionSnapshot({
    document,
    userId,
    reason: "manual",
    summary: "Initial document version",
    force: true,
  });

  await logActivity({
    type: ACTIVITY_TYPES.DOCUMENT_CREATED,
    document: document._id,
    actor: userId,
    metadata: { title },
  });

  return document;
};

const updateDocument = async ({ id, data, userId }) => {
  const { document: existingDocument } = await assertDocumentAccess({ documentId: id, userId, permission: "edit" });
  const normalizedContent =
    data.content !== undefined ? normalizeEditorContent(data.content) : existingDocument.content;

  const titleChanged = data.title !== undefined && data.title !== existingDocument.title;
  const contentHash = createContentHash(normalizedContent);
  const contentChanged = contentHash !== existingDocument.metadata?.contentHash;

  const updatePayload = {
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.content !== undefined ? { content: normalizedContent } : {}),
    "metadata.lastEditedBy": userId,
    "metadata.lastEditedAt": new Date(),
    "metadata.contentHash": contentHash,
  };

  const document = await updateDocumentById({
    documentId: id,
    payload: updatePayload,
  });

  if (!document) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Document not found");
  }

  if (contentChanged || titleChanged) {
    const snapshotCandidate = document.toObject();
    snapshotCandidate.metadata = existingDocument.metadata;

    await createVersionSnapshot({
      document: snapshotCandidate,
      userId,
      reason: titleChanged ? "manual" : "auto",
      summary: titleChanged ? "Document renamed" : "Autosaved editor snapshot",
    });

    await logActivity({
      type: titleChanged ? ACTIVITY_TYPES.DOCUMENT_RENAMED : ACTIVITY_TYPES.DOCUMENT_EDITED,
      document: document._id,
      actor: userId,
      metadata: {
        titleChanged,
        contentChanged,
      },
    });
  }

  return document;
};

const deleteDocument = async ({ id, userId }) => {
  const { document } = await assertDocumentAccess({ documentId: id, userId, permission: "share" });
  await softDeleteDocumentById({ documentId: document._id });

  await logActivity({
    type: ACTIVITY_TYPES.DOCUMENT_DELETED,
    document: document._id,
    actor: userId,
  });

  return { message: "Document deleted" };
};

export {
  assertValidObjectId,
  createDocument,
  deleteDocument,
  getDocumentById,
  getDocuments,
  updateDocument,
};
