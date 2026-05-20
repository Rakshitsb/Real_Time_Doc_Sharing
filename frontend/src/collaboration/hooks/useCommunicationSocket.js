import { useCallback, useEffect, useRef, useState } from "react";
import COMMUNICATION_EVENTS from "../socket/communicationEvents";
import { getSocket } from "../../socket/socketClient";

const mergeThread = (threads, nextThread) => {
  const exists = threads.some((thread) => thread._id === nextThread._id);
  if (!exists) return [nextThread, ...threads];
  return threads.map((thread) => (thread._id === nextThread._id ? { ...thread, ...nextThread } : thread));
};

const useCommunicationSocket = (documentId) => {
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [liveMessages, setLiveMessages] = useState([]);
  const [liveThreads, setLiveThreads] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!documentId) return undefined;

    const socket = getSocket();
    socketRef.current = socket;

    const handleMessageCreated = ({ message }) => {
      setLiveMessages((messages) => {
        if (messages.some((item) => item._id === message._id || item.clientId === message.clientId)) return messages;
        return [...messages, message];
      });
    };

    const handleThreadCreated = ({ thread }) => {
      setLiveThreads((threads) => mergeThread(threads, thread));
    };

    const handleReplyCreated = ({ thread, comment }) => {
      setLiveThreads((threads) =>
        mergeThread(
          threads.map((item) =>
            item._id === thread._id
              ? { ...item, ...thread, comments: [...(item.comments || []), comment] }
              : item
          ),
          { ...thread, comments: [comment] }
        )
      );
    };

    const handleThreadUpdated = ({ thread }) => {
      setLiveThreads((threads) => mergeThread(threads, thread));
    };

    const handleOnlineUsers = ({ users }) => setOnlineUsers(users || []);
    const handleTyping = ({ user, isTyping }) => {
      setTypingUsers((users) => {
        const withoutUser = users.filter((item) => item._id !== user._id);
        return isTyping ? [...withoutUser, user] : withoutUser;
      });
    };
    const handleNotification = (notification) => setNotifications((items) => [notification, ...items]);

    socket.emit(COMMUNICATION_EVENTS.JOIN, { documentId });
    socket.on(COMMUNICATION_EVENTS.CHAT_MESSAGE_CREATED, handleMessageCreated);
    socket.on(COMMUNICATION_EVENTS.COMMENT_THREAD_CREATED, handleThreadCreated);
    socket.on(COMMUNICATION_EVENTS.COMMENT_REPLY_CREATED, handleReplyCreated);
    socket.on(COMMUNICATION_EVENTS.COMMENT_THREAD_UPDATED, handleThreadUpdated);
    socket.on(COMMUNICATION_EVENTS.ONLINE_USERS, handleOnlineUsers);
    socket.on(COMMUNICATION_EVENTS.CHAT_TYPING_UPDATED, handleTyping);
    socket.on(COMMUNICATION_EVENTS.NOTIFICATION_CREATED, handleNotification);

    return () => {
      socket.emit(COMMUNICATION_EVENTS.LEAVE, { documentId });
      socket.off(COMMUNICATION_EVENTS.CHAT_MESSAGE_CREATED, handleMessageCreated);
      socket.off(COMMUNICATION_EVENTS.COMMENT_THREAD_CREATED, handleThreadCreated);
      socket.off(COMMUNICATION_EVENTS.COMMENT_REPLY_CREATED, handleReplyCreated);
      socket.off(COMMUNICATION_EVENTS.COMMENT_THREAD_UPDATED, handleThreadUpdated);
      socket.off(COMMUNICATION_EVENTS.ONLINE_USERS, handleOnlineUsers);
      socket.off(COMMUNICATION_EVENTS.CHAT_TYPING_UPDATED, handleTyping);
      socket.off(COMMUNICATION_EVENTS.NOTIFICATION_CREATED, handleNotification);
    };
  }, [documentId]);

  const sendChatMessage = useCallback(
    ({ body, clientId }) => {
      socketRef.current?.emit(COMMUNICATION_EVENTS.CHAT_MESSAGE_CREATE, { documentId, body, clientId });
    },
    [documentId]
  );

  const sendTyping = useCallback(
    (isTyping) => {
      socketRef.current?.emit(COMMUNICATION_EVENTS.CHAT_TYPING, { documentId, isTyping });
    },
    [documentId]
  );

  const createThread = useCallback(
    ({ body, anchor, clientId }) => {
      socketRef.current?.emit(COMMUNICATION_EVENTS.COMMENT_THREAD_CREATE, { documentId, body, anchor, clientId });
    },
    [documentId]
  );

  const createReply = useCallback(
    ({ threadId, body, clientId }) => {
      socketRef.current?.emit(COMMUNICATION_EVENTS.COMMENT_REPLY_CREATE, { documentId, threadId, body, clientId });
    },
    [documentId]
  );

  const resolveThread = useCallback(
    (threadId) => socketRef.current?.emit(COMMUNICATION_EVENTS.COMMENT_THREAD_RESOLVE, { documentId, threadId }),
    [documentId]
  );

  const reopenThread = useCallback(
    (threadId) => socketRef.current?.emit(COMMUNICATION_EVENTS.COMMENT_THREAD_REOPEN, { documentId, threadId }),
    [documentId]
  );

  return {
    createReply,
    createThread,
    liveMessages,
    liveThreads,
    notifications,
    onlineUsers,
    reopenThread,
    resolveThread,
    sendChatMessage,
    sendTyping,
    typingUsers,
  };
};

export default useCommunicationSocket;
