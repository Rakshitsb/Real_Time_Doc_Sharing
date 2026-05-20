import Notification from "../models/Notification.model.js";
import { buildPaginatedResult, getPagination } from "../utils/pagination.js";

const notificationUserRoom = (userId) => `user:${userId}:notifications`;

const serializeNotification = (notification) => {
  if (!notification) return notification;
  const data = typeof notification.toObject === "function" ? notification.toObject() : notification;
  return data;
};

const createNotifications = async ({ notifications = [], io }) => {
  if (!notifications.length) return [];

  const created = await Notification.insertMany(notifications, { ordered: false });
  created.forEach((notification) => {
    io?.to(notificationUserRoom(notification.recipient)).emit("notifications:created", serializeNotification(notification));
  });
  return created;
};

const getNotifications = async ({ userId, query = {} }) => {
  const { page, limit, skip } = getPagination({ page: query.page, limit: query.limit });
  const filter = { recipient: userId };
  const [data, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate("actor", "name email")
      .populate("document", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, readAt: null }),
  ]);

  return { ...buildPaginatedResult({ data, total, page, limit }), unreadCount };
};

const markNotificationsRead = async ({ userId, notificationIds = [] }) => {
  const filter = {
    recipient: userId,
    readAt: null,
    ...(notificationIds.length ? { _id: { $in: notificationIds } } : {}),
  };
  await Notification.updateMany(filter, { readAt: new Date() });
  return getNotifications({ userId, query: { page: 1, limit: 10 } });
};

export { createNotifications, getNotifications, markNotificationsRead, notificationUserRoom };
