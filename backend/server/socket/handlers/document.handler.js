import SOCKET_EVENTS from "../events/socket.events.js";
import { joinRoom, leaveRoom } from "../utils/roomManager.js";
import { logSocketEvent } from "../utils/socketLogger.js";
import { canAccessDocumentRoom } from "../collaboration/collaborationAccess.js";

const registerDocumentSocket = (io, socket) => {
  socket.on(SOCKET_EVENTS.JOIN_DOCUMENT, async (documentId) => {
    const access = await canAccessDocumentRoom({ documentId, user: socket.user, permission: "view" });
    if (!access.allowed) return;
    socket.data.documentRoles = socket.data.documentRoles || {};
    socket.data.documentRoles[documentId] = access.role;
    joinRoom(socket, documentId);
    logSocketEvent(SOCKET_EVENTS.JOIN_DOCUMENT, socket, { documentId });
  });

  socket.on(SOCKET_EVENTS.LEAVE_DOCUMENT, (documentId) => {
    leaveRoom(socket, documentId);
  });

  socket.on(SOCKET_EVENTS.DOCUMENT_UPDATE, ({ documentId, title, content }) => {
    if (!documentId || !["owner", "editor"].includes(socket.data.documentRoles?.[documentId])) return;
    socket.to(documentId).emit(SOCKET_EVENTS.RECEIVE_UPDATE, { title, content });
  });
};

export default registerDocumentSocket;
