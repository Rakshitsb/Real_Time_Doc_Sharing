import COMMUNICATION_EVENTS from "../events/communication.events.js";
import { canAccessDocumentRoom } from "../collaboration/collaborationAccess.js";
import {
  createChatMessage,
  createCommentReply,
  createCommentThread,
  setCommentThreadStatus,
} from "../../services/communication.service.js";
import { notificationUserRoom } from "../../services/notification.service.js";
import { emitSocketError, logSocketEvent } from "../utils/socketLogger.js";
import throttle from "../utils/throttle.js";

const communicationRoom = (documentId) => `communication:${documentId}`;

const registerCommunicationSocket = (io, socket) => {
  const joinedDocuments = new Set();
  const typingBroadcast = throttle(({ documentId, isTyping }) => {
    socket.to(communicationRoom(documentId)).emit(COMMUNICATION_EVENTS.CHAT_TYPING_UPDATED, {
      documentId,
      isTyping: Boolean(isTyping),
      user: {
        _id: socket.user._id,
        name: socket.user.name,
        email: socket.user.email,
      },
    });
  }, 300);

  socket.join(notificationUserRoom(socket.user._id));

  const emitOnlineUsers = (documentId) => {
    const users = [];
    const room = io.sockets.adapter.rooms.get(communicationRoom(documentId));
    if (!room) {
      io.to(communicationRoom(documentId)).emit(COMMUNICATION_EVENTS.ONLINE_USERS, { documentId, users });
      return;
    }

    room.forEach((socketId) => {
      const member = io.sockets.sockets.get(socketId);
      if (member?.user) {
        users.push({
          _id: member.user._id,
          name: member.user.name,
          email: member.user.email,
        });
      }
    });

    io.to(communicationRoom(documentId)).emit(COMMUNICATION_EVENTS.ONLINE_USERS, {
      documentId,
      users: [...new Map(users.map((user) => [user._id, user])).values()],
    });
  };

  const leaveDocument = (documentId) => {
    if (!documentId) return;
    socket.leave(communicationRoom(documentId));
    joinedDocuments.delete(documentId);
    emitOnlineUsers(documentId);
  };

  socket.on(COMMUNICATION_EVENTS.JOIN, async ({ documentId } = {}) => {
    try {
      const access = await canAccessDocumentRoom({ documentId, user: socket.user, permission: "view" });
      if (!access.allowed) {
        emitSocketError(socket, COMMUNICATION_EVENTS.ERROR, "Not authorized to join communication room", { documentId });
        return;
      }

      socket.join(communicationRoom(documentId));
      joinedDocuments.add(documentId);
      socket.data.communicationRoles = socket.data.communicationRoles || {};
      socket.data.communicationRoles[documentId] = access.role;
      emitOnlineUsers(documentId);
      logSocketEvent(COMMUNICATION_EVENTS.JOIN, socket, { documentId });
    } catch (error) {
      emitSocketError(socket, COMMUNICATION_EVENTS.ERROR, "Unable to join communication room", { documentId });
    }
  });

  socket.on(COMMUNICATION_EVENTS.LEAVE, ({ documentId } = {}) => leaveDocument(documentId));

  socket.on(COMMUNICATION_EVENTS.CHAT_TYPING, ({ documentId, isTyping } = {}) => {
    if (!joinedDocuments.has(documentId)) return;
    typingBroadcast({ documentId, isTyping });
  });

  socket.on(COMMUNICATION_EVENTS.CHAT_MESSAGE_CREATE, async ({ documentId, body, clientId } = {}) => {
    try {
      if (!joinedDocuments.has(documentId) || socket.data.communicationRoles?.[documentId] === "viewer") return;
      const message = await createChatMessage({ documentId, userId: socket.user._id, body, clientId, io });
      io.to(communicationRoom(documentId)).emit(COMMUNICATION_EVENTS.CHAT_MESSAGE_CREATED, { documentId, message });
    } catch (error) {
      emitSocketError(socket, COMMUNICATION_EVENTS.ERROR, "Unable to send chat message", { clientId });
    }
  });

  socket.on(COMMUNICATION_EVENTS.COMMENT_THREAD_CREATE, async ({ documentId, body, anchor, clientId } = {}) => {
    try {
      if (!joinedDocuments.has(documentId) || socket.data.communicationRoles?.[documentId] === "viewer") return;
      const thread = await createCommentThread({ documentId, userId: socket.user._id, body, anchor, io });
      io.to(communicationRoom(documentId)).emit(COMMUNICATION_EVENTS.COMMENT_THREAD_CREATED, { documentId, thread, clientId });
    } catch (error) {
      emitSocketError(socket, COMMUNICATION_EVENTS.ERROR, "Unable to create comment", { clientId });
    }
  });

  socket.on(COMMUNICATION_EVENTS.COMMENT_REPLY_CREATE, async ({ documentId, threadId, body, clientId } = {}) => {
    try {
      if (!joinedDocuments.has(documentId) || socket.data.communicationRoles?.[documentId] === "viewer") return;
      const reply = await createCommentReply({ documentId, threadId, userId: socket.user._id, body, io });
      io.to(communicationRoom(documentId)).emit(COMMUNICATION_EVENTS.COMMENT_REPLY_CREATED, { documentId, ...reply, clientId });
    } catch (error) {
      emitSocketError(socket, COMMUNICATION_EVENTS.ERROR, "Unable to add reply", { clientId });
    }
  });

  const updateThreadStatus = async ({ documentId, threadId, status }) => {
    if (!joinedDocuments.has(documentId) || socket.data.communicationRoles?.[documentId] === "viewer") return;
    const thread = await setCommentThreadStatus({ documentId, threadId, userId: socket.user._id, status, io });
    io.to(communicationRoom(documentId)).emit(COMMUNICATION_EVENTS.COMMENT_THREAD_UPDATED, { documentId, thread });
  };

  socket.on(COMMUNICATION_EVENTS.COMMENT_THREAD_RESOLVE, (payload = {}) =>
    updateThreadStatus({ ...payload, status: "resolved" }).catch(() =>
      emitSocketError(socket, COMMUNICATION_EVENTS.ERROR, "Unable to resolve comment")
    )
  );
  socket.on(COMMUNICATION_EVENTS.COMMENT_THREAD_REOPEN, (payload = {}) =>
    updateThreadStatus({ ...payload, status: "open" }).catch(() =>
      emitSocketError(socket, COMMUNICATION_EVENTS.ERROR, "Unable to reopen comment")
    )
  );

  socket.on("disconnect", () => {
    typingBroadcast.cancel();
    joinedDocuments.forEach((documentId) => leaveDocument(documentId));
    socket.leave(notificationUserRoom(socket.user._id));
  });
};

export { communicationRoom };
export default registerCommunicationSocket;
