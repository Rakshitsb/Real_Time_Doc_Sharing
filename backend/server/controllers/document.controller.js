import asyncHandler from "../utils/asyncHandler.js";
import sendSuccess from "../utils/sendResponse.js";
import HTTP_STATUS from "../constants/httpStatus.js";
import {
  createDocument,
  deleteDocument,
  getDocumentById,
  getDocuments,
  updateDocument,
} from "../services/document.service.js";
import {
  getDocumentVersion,
  getDocumentVersions,
  restoreDocumentVersion,
} from "../services/documentVersion.service.js";
import { getDocumentActivities } from "../services/activity.service.js";
import SOCKET_EVENTS from "../socket/events/socket.events.js";
import { assertDocumentAccess } from "../services/documentAccess.service.js";

const listDocuments = asyncHandler(async (req, res) => {
  const documents = await getDocuments({ userId: req.user._id, query: req.query });
  sendSuccess(res, documents);
});

const getDocument = asyncHandler(async (req, res) => {
  const document = await getDocumentById({ id: req.params.id, userId: req.user._id });
  sendSuccess(res, document);
});

const addDocument = asyncHandler(async (req, res) => {
  const document = await createDocument(req.body, req.user._id);
  sendSuccess(res, document, HTTP_STATUS.CREATED);
});

const editDocument = asyncHandler(async (req, res) => {
  const document = await updateDocument({ id: req.params.id, data: req.body, userId: req.user._id });
  sendSuccess(res, document);
});

const removeDocument = asyncHandler(async (req, res) => {
  const result = await deleteDocument({ id: req.params.id, userId: req.user._id });
  sendSuccess(res, result);
});

const listDocumentVersions = asyncHandler(async (req, res) => {
  const document = await getDocumentById({ id: req.params.id, userId: req.user._id, lean: true });
  const versions = await getDocumentVersions({ documentId: document._id, query: req.query });
  sendSuccess(res, versions);
});

const getVersion = asyncHandler(async (req, res) => {
  const document = await getDocumentById({ id: req.params.id, userId: req.user._id, lean: true });
  const version = await getDocumentVersion({
    documentId: document._id,
    versionId: req.params.versionId,
  });
  sendSuccess(res, version);
});

const restoreVersion = asyncHandler(async (req, res) => {
  const { document } = await assertDocumentAccess({ documentId: req.params.id, userId: req.user._id, permission: "edit" });
  const restoredDocument = await restoreDocumentVersion({
    document,
    versionId: req.params.versionId,
    userId: req.user._id,
  });

  const io = req.app.get("io");
  if (io) {
    io.to(req.params.id).emit(SOCKET_EVENTS.RECEIVE_UPDATE, {
      title: restoredDocument.title,
      content: restoredDocument.content,
      restored: true,
    });
  }

  sendSuccess(res, restoredDocument);
});

const listDocumentActivities = asyncHandler(async (req, res) => {
  const document = await getDocumentById({ id: req.params.id, userId: req.user._id, lean: true });
  const activities = await getDocumentActivities({ documentId: document._id, query: req.query });
  sendSuccess(res, activities);
});

export {
  addDocument,
  editDocument,
  getDocument,
  getVersion,
  listDocumentActivities,
  listDocumentVersions,
  listDocuments,
  removeDocument,
  restoreVersion,
};
