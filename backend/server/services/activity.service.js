import ACTIVITY_TYPES from "../constants/activityTypes.js";
import {
  countActivitiesByDocument,
  createActivity,
  findActivitiesByDocument,
} from "../repositories/activity.repository.js";
import { DEFAULT_ACTIVITY_LIMIT, MAX_ACTIVITY_LIMIT } from "../constants/versioning.js";
import { buildPaginatedResult, getPagination } from "../utils/pagination.js";

const logActivity = async ({ type, document, actor, metadata = {} }) => {
  return createActivity({
    type,
    document,
    actor,
    metadata,
  });
};

const getDocumentActivities = async ({ documentId, query }) => {
  const { page, limit, skip } = getPagination({
    page: query.page,
    limit: query.limit || DEFAULT_ACTIVITY_LIMIT,
    maxLimit: MAX_ACTIVITY_LIMIT,
  });

  const [data, total] = await Promise.all([
    findActivitiesByDocument({ documentId, skip, limit }),
    countActivitiesByDocument(documentId),
  ]);

  return buildPaginatedResult({ data, total, page, limit });
};

export { ACTIVITY_TYPES, getDocumentActivities, logActivity };
