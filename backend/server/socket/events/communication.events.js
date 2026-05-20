const COMMUNICATION_EVENTS = {
  JOIN: "communication:join",
  LEAVE: "communication:leave",
  ERROR: "communication:error",
  ONLINE_USERS: "communication:online-users",

  CHAT_MESSAGE_CREATE: "chat:message:create",
  CHAT_MESSAGE_CREATED: "chat:message:created",
  CHAT_TYPING: "chat:typing",
  CHAT_TYPING_UPDATED: "chat:typing:updated",

  COMMENT_THREAD_CREATE: "comments:thread:create",
  COMMENT_THREAD_CREATED: "comments:thread:created",
  COMMENT_REPLY_CREATE: "comments:reply:create",
  COMMENT_REPLY_CREATED: "comments:reply:created",
  COMMENT_THREAD_RESOLVE: "comments:thread:resolve",
  COMMENT_THREAD_REOPEN: "comments:thread:reopen",
  COMMENT_THREAD_UPDATED: "comments:thread:updated",

  NOTIFICATION_CREATED: "notifications:created",
  NOTIFICATION_READ: "notifications:read",
};

export default COMMUNICATION_EVENTS;
