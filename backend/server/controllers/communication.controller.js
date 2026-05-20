import {
  createChatMessage,
  createCommentReply,
  createCommentThread,
  getChatMessages,
  getCommentThreads,
  searchMentionableUsers,
  setCommentThreadStatus,
} from "../services/communication.service.js";
import { getNotifications, markNotificationsRead } from "../services/notification.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendSuccess from "../utils/sendResponse.js";
import HTTP_STATUS from "../constants/httpStatus.js";

const listChatMessages = asyncHandler(async (req, res) => {
  const messages = await getChatMessages({ documentId: req.params.id, userId: req.user._id, query: req.query });
  sendSuccess(res, messages);
});

const addChatMessage = asyncHandler(async (req, res) => {
  const message = await createChatMessage({
    documentId: req.params.id,
    userId: req.user._id,
    body: req.body.body,
    clientId: req.body.clientId,
    io: req.app.get("io"),
  });
  sendSuccess(res, message, HTTP_STATUS.CREATED);
});

const listCommentThreads = asyncHandler(async (req, res) => {
  const threads = await getCommentThreads({ documentId: req.params.id, userId: req.user._id, query: req.query });
  sendSuccess(res, threads);
});

const addCommentThread = asyncHandler(async (req, res) => {
  const thread = await createCommentThread({
    documentId: req.params.id,
    userId: req.user._id,
    body: req.body.body,
    anchor: req.body.anchor,
    io: req.app.get("io"),
  });
  sendSuccess(res, thread, HTTP_STATUS.CREATED);
});

const addCommentReply = asyncHandler(async (req, res) => {
  const reply = await createCommentReply({
    documentId: req.params.id,
    threadId: req.params.threadId,
    userId: req.user._id,
    body: req.body.body,
    io: req.app.get("io"),
  });
  sendSuccess(res, reply, HTTP_STATUS.CREATED);
});

const resolveCommentThread = asyncHandler(async (req, res) => {
  const thread = await setCommentThreadStatus({
    documentId: req.params.id,
    threadId: req.params.threadId,
    userId: req.user._id,
    status: "resolved",
    io: req.app.get("io"),
  });
  sendSuccess(res, thread);
});

const reopenCommentThread = asyncHandler(async (req, res) => {
  const thread = await setCommentThreadStatus({
    documentId: req.params.id,
    threadId: req.params.threadId,
    userId: req.user._id,
    status: "open",
    io: req.app.get("io"),
  });
  sendSuccess(res, thread);
});

const searchMentions = asyncHandler(async (req, res) => {
  const users = await searchMentionableUsers({
    documentId: req.params.id,
    userId: req.user._id,
    query: req.query.q,
  });
  sendSuccess(res, users);
});

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await getNotifications({ userId: req.user._id, query: req.query });
  sendSuccess(res, notifications);
});

const markRead = asyncHandler(async (req, res) => {
  const notifications = await markNotificationsRead({
    userId: req.user._id,
    notificationIds: req.body.notificationIds || [],
  });
  sendSuccess(res, notifications);
});

export {
  addChatMessage,
  addCommentReply,
  addCommentThread,
  listChatMessages,
  listCommentThreads,
  listNotifications,
  markRead,
  reopenCommentThread,
  resolveCommentThread,
  searchMentions,
};
