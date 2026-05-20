const broadcastPresence = ({ io, roomId, eventName, collaborators }) => {
  io.to(roomId).emit(eventName, { collaborators });
};

export { broadcastPresence };
