import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";
import ChatMessage from "../models/ChatMessage.model.js";
import Comment from "../models/Comment.model.js";
import CommentThread from "../models/CommentThread.model.js";
import Mention from "../models/Mention.model.js";
import User from "../models/User.model.js";
import { getDocumentById } from "./document.service.js";
import { assertDocumentAccess } from "./documentAccess.service.js";
import { ACTIVITY_TYPES, logActivity } from "./activity.service.js";
import { createNotifications } from "./notification.service.js";
import { buildPaginatedResult, getPagination } from "../utils/pagination.js";
import { extractMentionIds } from "../utils/mentions.js";

const userSelect = "name email";

const assertUserCanAccessDocument = async ({ documentId, userId }) => {
  return getDocumentById({ id: documentId, userId, lean: true });
};

const assertUserCanCommentDocument = async ({ documentId, userId }) => {
  const { document } = await assertDocumentAccess({ documentId, userId, permission: "comment" });
  return document;
};

const validateMentionUsers = async ({ document, mentionIds = [] }) => {
  const uniqueIds = [...new Set(mentionIds.map(String))].filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!uniqueIds.length) return [];

  const allowed = new Set([
    String(document.owner),
    ...(document.collaborators || []).map((collaborator) => String(collaborator.user)),
  ]);

  return uniqueIds.filter((id) => allowed.has(String(id)));
};

const createMentionRecords = async ({ documentId, actor, sourceType, sourceId, thread, mentionIds }) => {
  if (!mentionIds.length) return [];
  return Mention.insertMany(
    mentionIds.map((mentionedUser) => ({
      document: documentId,
      mentionedUser,
      actor,
      sourceType,
      sourceId,
      thread,
    })),
    { ordered: false }
  );
};

const getChatMessages = async ({ documentId, userId, query = {} }) => {
  await assertUserCanAccessDocument({ documentId, userId });
  const { page, limit, skip } = getPagination({ page: query.page, limit: query.limit });
  const filter = { document: documentId };
  const [data, total] = await Promise.all([
    ChatMessage.find(filter).populate("author", userSelect).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ChatMessage.countDocuments(filter),
  ]);

  return buildPaginatedResult({ data: data.reverse(), total, page, limit });
};

const createChatMessage = async ({ documentId, userId, body, clientId, io }) => {
  const document = await assertUserCanCommentDocument({ documentId, userId });
  const mentions = await validateMentionUsers({ document, mentionIds: extractMentionIds(body) });
  const message = await ChatMessage.create({
    document: documentId,
    workspace: document.workspace,
    author: userId,
    body,
    clientId,
    mentions,
  });
  await message.populate("author", userSelect);

  await createMentionRecords({
    documentId,
    actor: userId,
    sourceType: "chat",
    sourceId: message._id,
    mentionIds: mentions,
  });

  await createNotifications({
    io,
    notifications: mentions
      .filter((recipient) => String(recipient) !== String(userId))
      .map((recipient) => ({
        recipient,
        actor: userId,
        document: documentId,
        type: "mention.chat",
        title: "You were mentioned in chat",
        body: message.body.slice(0, 180),
        sourceType: "chat",
        sourceId: message._id,
      })),
  });

  await logActivity({
    type: ACTIVITY_TYPES.CHAT_MESSAGE_CREATED,
    document: documentId,
    actor: userId,
    metadata: { messageId: message._id, mentionCount: mentions.length },
  });

  return message;
};

const getCommentThreads = async ({ documentId, userId, query = {} }) => {
  await assertUserCanAccessDocument({ documentId, userId });
  const { page, limit, skip } = getPagination({ page: query.page, limit: query.limit });
  const status = query.status && query.status !== "all" ? query.status : undefined;
  const filter = { document: documentId, ...(status ? { status } : {}) };

  const [threads, total] = await Promise.all([
    CommentThread.find(filter)
      .populate("createdBy", userSelect)
      .populate("resolvedBy", userSelect)
      .sort({ status: 1, lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CommentThread.countDocuments(filter),
  ]);

  const comments = await Comment.find({ thread: { $in: threads.map((thread) => thread._id) }, isDeleted: false })
    .populate("author", userSelect)
    .sort({ createdAt: 1 })
    .lean();
  const commentsByThread = comments.reduce((acc, comment) => {
    const key = String(comment.thread);
    acc[key] = acc[key] || [];
    acc[key].push(comment);
    return acc;
  }, {});

  return buildPaginatedResult({
    data: threads.map((thread) => ({ ...thread, comments: commentsByThread[String(thread._id)] || [] })),
    total,
    page,
    limit,
  });
};

const createCommentThread = async ({ documentId, userId, body, anchor, io }) => {
  const document = await assertUserCanCommentDocument({ documentId, userId });
  const mentions = await validateMentionUsers({ document, mentionIds: extractMentionIds(body) });
  const thread = await CommentThread.create({
    document: documentId,
    workspace: document.workspace,
    anchor,
    createdBy: userId,
    participants: [userId, ...mentions],
    mentions,
  });
  const comment = await Comment.create({ thread: thread._id, document: documentId, author: userId, body, mentions });
  thread.replyCount = 1;
  thread.lastMessageAt = comment.createdAt;
  await thread.save();

  await Promise.all([thread.populate("createdBy", userSelect), comment.populate("author", userSelect)]);
  await createMentionRecords({ documentId, actor: userId, sourceType: "comment", sourceId: comment._id, thread: thread._id, mentionIds: mentions });
  await createNotifications({
    io,
    notifications: mentions
      .filter((recipient) => String(recipient) !== String(userId))
      .map((recipient) => ({
        recipient,
        actor: userId,
        document: documentId,
        type: "mention.comment",
        title: "You were mentioned in a comment",
        body: body.slice(0, 180),
        sourceType: "comment",
        sourceId: comment._id,
      })),
  });

  await logActivity({
    type: ACTIVITY_TYPES.COMMENT_ADDED,
    document: documentId,
    actor: userId,
    metadata: { threadId: thread._id, commentId: comment._id, mentionCount: mentions.length },
  });

  return { ...thread.toObject(), comments: [comment.toObject()] };
};

const createCommentReply = async ({ documentId, threadId, userId, body, io }) => {
  const document = await assertUserCanCommentDocument({ documentId, userId });
  const thread = await CommentThread.findOne({ _id: threadId, document: documentId });
  if (!thread) throw new ApiError(HTTP_STATUS.NOT_FOUND, "Comment thread not found");

  const mentions = await validateMentionUsers({ document, mentionIds: extractMentionIds(body) });
  const comment = await Comment.create({ thread: thread._id, document: documentId, author: userId, body, mentions });
  thread.replyCount += 1;
  thread.lastMessageAt = comment.createdAt;
  thread.participants = [...new Set([...thread.participants.map(String), String(userId), ...mentions.map(String)])];
  thread.mentions = [...new Set([...thread.mentions.map(String), ...mentions.map(String)])];
  await thread.save();
  await comment.populate("author", userSelect);

  await createMentionRecords({ documentId, actor: userId, sourceType: "comment", sourceId: comment._id, thread: thread._id, mentionIds: mentions });

  const recipients = [...new Set([...thread.participants.map(String), ...mentions.map(String)])].filter((id) => id !== String(userId));
  await createNotifications({
    io,
    notifications: recipients.map((recipient) => ({
      recipient,
      actor: userId,
      document: documentId,
      type: mentions.map(String).includes(recipient) ? "mention.comment" : "comment.reply",
      title: mentions.map(String).includes(recipient) ? "You were mentioned in a reply" : "New reply in a comment thread",
      body: body.slice(0, 180),
      sourceType: "comment",
      sourceId: comment._id,
    })),
  });

  await logActivity({
    type: ACTIVITY_TYPES.COMMENT_REPLY_ADDED,
    document: documentId,
    actor: userId,
    metadata: { threadId: thread._id, commentId: comment._id, mentionCount: mentions.length },
  });

  return { thread: await CommentThread.findById(thread._id).populate("createdBy", userSelect).populate("resolvedBy", userSelect).lean(), comment: comment.toObject() };
};

const setCommentThreadStatus = async ({ documentId, threadId, userId, status, io }) => {
  await assertUserCanCommentDocument({ documentId, userId });
  const payload =
    status === "resolved"
      ? { status, resolvedBy: userId, resolvedAt: new Date() }
      : { status: "open", resolvedBy: null, resolvedAt: null };
  const thread = await CommentThread.findOneAndUpdate({ _id: threadId, document: documentId }, payload, { new: true })
    .populate("createdBy", userSelect)
    .populate("resolvedBy", userSelect)
    .lean();
  if (!thread) throw new ApiError(HTTP_STATUS.NOT_FOUND, "Comment thread not found");

  await logActivity({
    type: status === "resolved" ? ACTIVITY_TYPES.COMMENT_RESOLVED : ACTIVITY_TYPES.COMMENT_REOPENED,
    document: documentId,
    actor: userId,
    metadata: { threadId },
  });

  await createNotifications({
    io,
    notifications: thread.participants
      .map(String)
      .filter((recipient) => recipient !== String(userId))
      .map((recipient) => ({
        recipient,
        actor: userId,
        document: documentId,
        type: status === "resolved" ? "comment.resolved" : "comment.reopened",
        title: status === "resolved" ? "Comment resolved" : "Comment reopened",
        sourceType: "thread",
        sourceId: thread._id,
      })),
  });

  return thread;
};

const searchMentionableUsers = async ({ documentId, userId, query = "" }) => {
  const document = await assertUserCanAccessDocument({ documentId, userId });
  const allowedIds = [document.owner, ...(document.collaborators || []).map((collaborator) => collaborator.user)];
  const filter = {
    _id: { $in: allowedIds },
    ...(query
      ? {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        }
      : {}),
  };

  return User.find(filter).select(userSelect).sort({ name: 1 }).limit(8).lean();
};

export {
  createChatMessage,
  createCommentReply,
  createCommentThread,
  getChatMessages,
  getCommentThreads,
  searchMentionableUsers,
  setCommentThreadStatus,
};
