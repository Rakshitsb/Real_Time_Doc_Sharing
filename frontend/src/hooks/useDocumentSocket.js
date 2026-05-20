import { useCallback, useEffect, useRef } from "react";
import { getSocket } from "../socket/socketClient";
import SOCKET_EVENTS from "../socket/socketEvents";

const useDocumentSocket = (documentId, onRemoteUpdate) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!documentId) return undefined;

    const socket = getSocket();
    socketRef.current = socket;

    socket.emit(SOCKET_EVENTS.JOIN_DOCUMENT, documentId);
    socket.on(SOCKET_EVENTS.RECEIVE_UPDATE, onRemoteUpdate);

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_DOCUMENT, documentId);
      socket.off(SOCKET_EVENTS.RECEIVE_UPDATE, onRemoteUpdate);
    };
  }, [documentId, onRemoteUpdate]);

  const sendDocumentUpdate = useCallback(
    (payload) => {
      if (!documentId || !socketRef.current) return;

      socketRef.current.emit(SOCKET_EVENTS.DOCUMENT_UPDATE, {
        documentId,
        ...payload,
      });
    },
    [documentId]
  );

  return { sendDocumentUpdate };
};

export default useDocumentSocket;
