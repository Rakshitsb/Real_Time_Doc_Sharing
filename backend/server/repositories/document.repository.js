import mongoose from "mongoose";
import Document from "../models/Document.model.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const accessFilter = (userId) => ({
  isDeleted: false,
  $or: [
    { owner: toObjectId(userId) },
    { "collaborators.user": toObjectId(userId) },
    { visibility: "public-readonly" },
  ],
});

const findAccessibleDocuments = ({ userId, skip = 0, limit = 20 }) => {
  return Document.find(accessFilter(userId))
    .select("title owner collaborators metadata permissions visibility shareSettings createdAt updatedAt")
    .populate("owner", "name email")
    .populate("collaborators.user", "name email")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

const countAccessibleDocuments = (userId) => Document.countDocuments(accessFilter(userId));

const findAccessibleDocumentById = ({ documentId, userId, lean = false }) => {
  const query = Document.findOne({
    _id: documentId,
    ...accessFilter(userId),
  })
    .populate("owner", "name email")
    .populate("collaborators.user", "name email")
    .populate("collaborators.invitedBy", "name email");

  return lean ? query.lean() : query;
};

const findDocumentById = ({ documentId, lean = false }) => {
  const query = Document.findOne({ _id: documentId, isDeleted: false })
    .populate("owner", "name email")
    .populate("collaborators.user", "name email")
    .populate("collaborators.invitedBy", "name email");

  return lean ? query.lean() : query;
};

const createDocumentRecord = (payload) => Document.create(payload);

const updateDocumentById = ({ documentId, payload }) => {
  return Document.findByIdAndUpdate(documentId, payload, {
    new: true,
    runValidators: true,
  });
};

const softDeleteDocumentById = ({ documentId }) => {
  return Document.findByIdAndUpdate(
    documentId,
    {
      isDeleted: true,
      deletedAt: new Date(),
    },
    { new: true }
  );
};

export {
  accessFilter,
  countAccessibleDocuments,
  createDocumentRecord,
  findAccessibleDocumentById,
  findAccessibleDocuments,
  findDocumentById,
  softDeleteDocumentById,
  updateDocumentById,
};
