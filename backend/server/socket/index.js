import { Server } from "socket.io";
import env from "../config/env.js";
import registerDocumentSocket from "./handlers/document.handler.js";
import registerCollaborationSocket from "./handlers/collaboration.handler.js";
import registerCommunicationSocket from "./handlers/communication.handler.js";
import SOCKET_EVENTS from "./events/socket.events.js";
import socketAuthMiddleware from "./middleware/socketAuth.middleware.js";
import logger from "../utils/logger.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      methods: ["GET", "POST"],
      credentials: true,
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: false,
    },
    maxHttpBufferSize: env.socketMaxHttpBufferSize,
  });

  io.use(socketAuthMiddleware);

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    logger.info("socket_connected", { socketId: socket.id, userId: socket.user?._id });
    registerDocumentSocket(io, socket);
    registerCollaborationSocket(io, socket);
    registerCommunicationSocket(io, socket);

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logger.info("socket_disconnected", { socketId: socket.id, userId: socket.user?._id, reason });
      socket.removeAllListeners();
    });
  });

  return io;
};

export default initializeSocket;
