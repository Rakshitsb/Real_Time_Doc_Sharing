import DocumentVersion from "../models/DocumentVersion.model.js";

const createDocumentVersion = (payload) => DocumentVersion.create(payload);

const getNextVersionNumber = async (documentId) => {
  const latestVersion = await DocumentVersion.findOne({ document: documentId })
    .select("versionNumber")
    .sort({ versionNumber: -1 })
    .lean();

  return (latestVersion?.versionNumber || 0) + 1;
};

const findVersionsByDocument = ({ documentId, skip = 0, limit = 20 }) => {
  return DocumentVersion.find({ document: documentId })
    .select("versionNumber title reason summary createdBy metadata createdAt")
    .populate("createdBy", "name email")
    .sort({ versionNumber: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

const countVersionsByDocument = (documentId) => DocumentVersion.countDocuments({ document: documentId });

const findVersionById = ({ documentId, versionId }) => {
  return DocumentVersion.findOne({ _id: versionId, document: documentId })
    .populate("createdBy", "name email")
    .lean();
};

export {
  countVersionsByDocument,
  createDocumentVersion,
  findVersionById,
  findVersionsByDocument,
  getNextVersionNumber,
};
