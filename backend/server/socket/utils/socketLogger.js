import logger from "../../utils/logger.js";

const logSocketEvent = (event, socket, metadata = {}) => {
  logger.debug("socket_event", {
    event,
    socketId: socket.id,
    userId: socket.user?._id,
    ...metadata,
  });
};

const emitSocketError = (socket, eventName, message, metadata = {}) => {
  logger.warn("socket_error", {
    event: eventName,
    socketId: socket.id,
    userId: socket.user?._id,
    message,
    ...metadata,
  });
  socket.emit(eventName, { message, ...metadata });
};

export { emitSocketError, logSocketEvent };
