import Activity from "../models/Activity.model.js";

const createActivity = (payload) => Activity.create(payload);

const findActivitiesByDocument = ({ documentId, skip = 0, limit = 20 }) => {
  return Activity.find({ document: documentId })
    .populate("actor", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

const countActivitiesByDocument = (documentId) => Activity.countDocuments({ document: documentId });

export { countActivitiesByDocument, createActivity, findActivitiesByDocument };
