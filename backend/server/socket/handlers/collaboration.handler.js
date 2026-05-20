import * as Y from "yjs";
import COLLABORATION_EVENTS from "../events/collaboration.events.js";
import {
  addSocketToRoom,
  applyRoomAwarenessUpdate,
  encodeRoomAwareness,
  getOrCreateCollaborationRoom,
  getPresenceList,
  getRoomId,
  removeSocketFromRoom,
} from "../rooms/collaborationRoomStore.js";
import { canAccessDocumentRoom } from "../collaboration/collaborationAccess.js";
import { toSerializableUpdate, toUint8Array } from "../collaboration/collaborationState.js";
import { broadcastPresence } from "../awareness/presence.js";
import { emitSocketError, logSocketEvent } from "../utils/socketLogger.js";
import throttle from "../utils/throttle.js";

const registerCollaborationSocket = (io, socket) => {
  const awarenessBroadcast = throttle(({ documentId, update }) => {
    socket.to(getRoomId(documentId)).emit(COLLABORATION_EVENTS.AWARENESS_UPDATE, {
      documentId,
      update,
    });
  }, 80);

  const leaveCurrentRoom = () => {
    const documentId = socket.data.collaborationDocumentId;
    if (!documentId) return;

    const roomId = getRoomId(documentId);
    removeSocketFromRoom({ documentId, socketId: socket.id, origin: socket.id });
    socket.leave(roomId);
    socket.data.collaborationDocumentId = null;

    broadcastPresence({
      io,
      roomId,
      eventName: COLLABORATION_EVENTS.PRESENCE,
      collaborators: getPresenceList(documentId),
    });
    logSocketEvent(COLLABORATION_EVENTS.LEAVE, socket, { documentId });
  };

  socket.on(COLLABORATION_EVENTS.JOIN, async ({ documentId, clientId, user } = {}) => {
    try {
      const access = await canAccessDocumentRoom({ documentId, user: socket.user, permission: "view" });
      if (!access.allowed) {
        emitSocketError(socket, COLLABORATION_EVENTS.ERROR, "Not authorized to join document room", { documentId });
        return;
      }

      leaveCurrentRoom();

      const roomId = getRoomId(documentId);
      socket.join(roomId);
      socket.data.collaborationDocumentId = documentId;
      socket.data.collaborationRole = access.role;

      const room = addSocketToRoom({
        documentId,
        socketId: socket.id,
        clientId,
        user: {
          ...socket.user,
          ...user,
        },
      });

      socket.emit(COLLABORATION_EVENTS.SYNC_STATE, {
        documentId,
        update: toSerializableUpdate(Y.encodeStateAsUpdate(room.ydoc)),
        awarenessUpdate: encodeRoomAwareness(room)
          ? toSerializableUpdate(encodeRoomAwareness(room))
          : null,
      });

      broadcastPresence({
        io,
        roomId,
        eventName: COLLABORATION_EVENTS.PRESENCE,
        collaborators: getPresenceList(documentId),
      });
      logSocketEvent(COLLABORATION_EVENTS.JOIN, socket, { documentId });
    } catch (error) {
      emitSocketError(socket, COLLABORATION_EVENTS.ERROR, "Unable to join collaboration room", { documentId });
    }
  });

  socket.on(COLLABORATION_EVENTS.UPDATE, ({ documentId, update } = {}) => {
    if (
      !documentId ||
      socket.data.collaborationDocumentId !== documentId ||
      !update ||
      !["owner", "editor"].includes(socket.data.collaborationRole)
    ) {
      return;
    }

    const room = getOrCreateCollaborationRoom(documentId);
    const yUpdate = toUint8Array(update);
    Y.applyUpdate(room.ydoc, yUpdate, socket.id);
    socket.volatile.to(getRoomId(documentId)).emit(COLLABORATION_EVENTS.UPDATE, {
      documentId,
      update: toSerializableUpdate(yUpdate),
    });
  });

  socket.on(COLLABORATION_EVENTS.AWARENESS_UPDATE, ({ documentId, update } = {}) => {
    if (!documentId || socket.data.collaborationDocumentId !== documentId || !update) return;

    applyRoomAwarenessUpdate({
      documentId,
      update: toUint8Array(update),
      origin: socket.id,
    });

    awarenessBroadcast({
      documentId,
      update,
    });
  });

  socket.on(COLLABORATION_EVENTS.LEAVE, leaveCurrentRoom);
  socket.on("disconnect", () => {
    awarenessBroadcast.cancel();
    leaveCurrentRoom();
  });
};

export default registerCollaborationSocket;
