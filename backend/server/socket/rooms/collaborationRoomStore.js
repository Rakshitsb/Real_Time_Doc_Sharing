import * as Y from "yjs";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";

const rooms = new Map();

const getRoomId = (documentId) => `document:${documentId}:collaboration`;

const getOrCreateCollaborationRoom = (documentId) => {
  if (!rooms.has(documentId)) {
    const document = new Y.Doc();
    rooms.set(documentId, {
      documentId,
      ydoc: document,
      awareness: new Awareness(document),
      sockets: new Set(),
      presence: new Map(),
      clientIds: new Map(),
    });
  }

  return rooms.get(documentId);
};

const addSocketToRoom = ({ documentId, socketId, clientId, user }) => {
  const room = getOrCreateCollaborationRoom(documentId);
  room.sockets.add(socketId);
  room.clientIds.set(socketId, clientId);
  room.presence.set(socketId, {
    id: socketId,
    clientId,
    name: user?.name || user?.email || "Collaborator",
    email: user?.email || "",
    color: user?.color,
    status: "online",
  });

  return room;
};

const removeSocketFromRoom = ({ documentId, socketId, origin }) => {
  const room = rooms.get(documentId);
  if (!room) return null;

  const clientId = room.clientIds.get(socketId);

  if (clientId !== undefined) {
    removeAwarenessStates(room.awareness, [clientId], origin);
  }

  room.sockets.delete(socketId);
  room.clientIds.delete(socketId);
  room.presence.delete(socketId);

  if (room.sockets.size === 0) {
    room.awareness.destroy();
    room.ydoc.destroy();
    rooms.delete(documentId);
  }

  return room;
};

const getPresenceList = (documentId) => {
  const room = rooms.get(documentId);
  if (!room) return [];

  return Array.from(room.presence.values());
};

const applyRoomAwarenessUpdate = ({ documentId, update, origin }) => {
  const room = getOrCreateCollaborationRoom(documentId);
  applyAwarenessUpdate(room.awareness, update, origin);
  return room;
};

const encodeRoomAwareness = (room) => {
  const clientIds = Array.from(room.awareness.getStates().keys());
  if (clientIds.length === 0) return null;

  return encodeAwarenessUpdate(room.awareness, clientIds);
};

export {
  addSocketToRoom,
  applyRoomAwarenessUpdate,
  encodeRoomAwareness,
  getOrCreateCollaborationRoom,
  getPresenceList,
  getRoomId,
  removeSocketFromRoom,
};
