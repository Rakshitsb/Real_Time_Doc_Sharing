import { useEffect, useState } from "react";
import { getSocket, getSocketStatus } from "../socket/socketClient";

/**
 * useSocketStatus — tracks the socket.io connection state.
 *
 * Returns:
 *   status:            "connected" | "connecting" | "disconnected" | "reconnecting"
 *   isConnected:       boolean
 *   reconnectAttempts: number
 */
const useSocketStatus = () => {
  const [status, setStatus] = useState(() => getSocketStatus());
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onConnect = () => {
      setStatus("connected");
      setReconnectAttempts(0);
    };

    const onDisconnect = () => {
      setStatus("disconnected");
    };

    const onConnecting = () => {
      setStatus("connecting");
    };

    const onReconnecting = (attempt) => {
      setStatus("reconnecting");
      setReconnectAttempts(attempt);
    };

    const onReconnected = () => {
      setStatus("connected");
      setReconnectAttempts(0);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connecting", onConnecting);
    socket.on("reconnect_attempt", onReconnecting);
    socket.on("reconnect", onReconnected);

    // Sync current state
    setStatus(socket.connected ? "connected" : "disconnected");

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connecting", onConnecting);
      socket.off("reconnect_attempt", onReconnecting);
      socket.off("reconnect", onReconnected);
    };
  }, []);

  return {
    status,
    isConnected: status === "connected",
    reconnectAttempts,
  };
};

export default useSocketStatus;
