import { useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import { getSocket } from "../../socket/socketClient";
import { getCurrentUser } from "../../utils/storage";
import useThrottleCallback from "../../hooks/useThrottleCallback";
import { applyAwarenessUpdate, createCollaborationProvider, encodeAwarenessUpdate } from "../provider/socketProvider";
import COLLABORATION_EVENTS from "../socket/collaborationEvents";
import { toSerializableUpdate, toUint8Array } from "../sync/updateEncoding";
import { getCollaborationUser } from "../utils/userIdentity";

const useCollaborationProvider = (documentId) => {
  const provider = useMemo(() => createCollaborationProvider(documentId), [documentId]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [collaborators, setCollaborators] = useState([]);
  const [isSynced, setIsSynced] = useState(false);
  const user = useMemo(() => getCollaborationUser(getCurrentUser()), []);
  const emitAwarenessUpdate = useThrottleCallback((socket, payload) => {
    socket.emit(COLLABORATION_EVENTS.AWARENESS_UPDATE, payload);
  }, 80);

  useEffect(() => {
    if (!documentId) return undefined;

    const socket = getSocket();
    const { document, awareness } = provider;

    const joinRoom = () => {
      setConnectionStatus("connected");
      setIsSynced(false);
      awareness.setLocalStateField("user", user);
      socket.emit(COLLABORATION_EVENTS.JOIN, {
        documentId,
        clientId: document.clientID,
        user,
      });
    };

    const handleDisconnect = () => setConnectionStatus("reconnecting");
    const handleConnectError = () => setConnectionStatus("error");

    const handleSyncState = ({ update, awarenessUpdate }) => {
      if (update) {
        Y.applyUpdate(document, toUint8Array(update), "server");
      }

      if (awarenessUpdate) {
        applyAwarenessUpdate(awareness, toUint8Array(awarenessUpdate), "server");
      }

      setIsSynced(true);
    };

    const handleRemoteUpdate = ({ update }) => {
      if (update) {
        Y.applyUpdate(document, toUint8Array(update), "server");
      }
    };

    const handleAwarenessUpdate = ({ update }) => {
      if (update) {
        applyAwarenessUpdate(awareness, toUint8Array(update), "server");
      }
    };

    const handlePresence = ({ collaborators: nextCollaborators }) => {
      setCollaborators(nextCollaborators || []);
    };

    const handleError = () => setConnectionStatus("error");

    const handleLocalDocumentUpdate = (update, origin) => {
      if (origin === "server") return;

      socket.emit(COLLABORATION_EVENTS.UPDATE, {
        documentId,
        update: toSerializableUpdate(update),
      });
    };

    const handleLocalAwarenessUpdate = ({ added, updated, removed }, origin) => {
      if (origin === "server") return;

      const changedClients = added.concat(updated, removed);
      if (changedClients.length === 0) return;

      const update = encodeAwarenessUpdate(awareness, changedClients);
      emitAwarenessUpdate(socket, {
        documentId,
        update: toSerializableUpdate(update),
      });
    };

    socket.on("connect", joinRoom);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on(COLLABORATION_EVENTS.SYNC_STATE, handleSyncState);
    socket.on(COLLABORATION_EVENTS.UPDATE, handleRemoteUpdate);
    socket.on(COLLABORATION_EVENTS.AWARENESS_UPDATE, handleAwarenessUpdate);
    socket.on(COLLABORATION_EVENTS.PRESENCE, handlePresence);
    socket.on(COLLABORATION_EVENTS.ERROR, handleError);
    document.on("update", handleLocalDocumentUpdate);
    awareness.on("update", handleLocalAwarenessUpdate);

    if (socket.connected) {
      joinRoom();
    } else {
      setConnectionStatus("connecting");
      socket.connect();
    }

    return () => {
      socket.emit(COLLABORATION_EVENTS.LEAVE, { documentId });
      socket.off("connect", joinRoom);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off(COLLABORATION_EVENTS.SYNC_STATE, handleSyncState);
      socket.off(COLLABORATION_EVENTS.UPDATE, handleRemoteUpdate);
      socket.off(COLLABORATION_EVENTS.AWARENESS_UPDATE, handleAwarenessUpdate);
      socket.off(COLLABORATION_EVENTS.PRESENCE, handlePresence);
      socket.off(COLLABORATION_EVENTS.ERROR, handleError);
      document.off("update", handleLocalDocumentUpdate);
      awareness.off("update", handleLocalAwarenessUpdate);
      awareness.setLocalState(null);
      provider.destroy();
      setIsSynced(false);
    };
  }, [documentId, emitAwarenessUpdate, provider, user]);

  return {
    awareness: provider.awareness,
    collaborators,
    connectionStatus,
    isSynced,
    provider,
    user,
    ydoc: provider.document,
  };
};

export default useCollaborationProvider;
