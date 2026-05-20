import { useEffect, useMemo, useRef, useState } from "react";
import { memo } from "react";
import { Bell, CheckCircle2, MessageCircle, MessageSquare, RotateCcw, Send, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import {
  getChatMessages,
  getCommentThreads,
  getNotifications,
  markNotificationsRead,
  searchMentionableUsers,
} from "../../services/communicationService";
import useCommunicationSocket from "../../collaboration/hooks/useCommunicationSocket";

const initials = (name = "User") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatTime = (date) =>
  date
    ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(date))
    : "";

const renderBody = (body = "") =>
  body.split(/(@\[[^\]]+\]\([a-f\d]{24}\))/gi).map((part, index) => {
    const mention = part.match(/^@\[([^\]]+)\]\([a-f\d]{24}\)$/i);
    if (mention) {
      return (
        <span key={`${part}-${index}`} className="rounded bg-accent/15 px-1 font-medium text-accent">
          @{mention[1]}
        </span>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });

const MentionComposerBase = ({ documentId, value, onChange, onSubmit, placeholder, minRows = 2 }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const queryRef = useRef("");

  useEffect(() => {
    const match = value.match(/@([\w.-]*)$/);
    queryRef.current = match?.[1] || "";
    if (!match) {
      setSuggestions([]);
      return undefined;
    }

    const timeout = window.setTimeout(async () => {
      const users = await searchMentionableUsers(documentId, queryRef.current);
      setSuggestions(users || []);
      setActiveIndex(0);
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [documentId, value]);

  const insertMention = (user) => {
    onChange(value.replace(/@([\w.-]*)$/, `@[${user.name}](${user._id}) `));
    setSuggestions([]);
  };

  const handleKeyDown = (event) => {
    if (suggestions.length && event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
      return;
    }
    if (suggestions.length && event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
      return;
    }
    if (suggestions.length && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      insertMention(suggestions[activeIndex]);
      return;
    }
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative">
      <Textarea
        className="resize-none"
        rows={minRows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-full overflow-hidden rounded-lg border border-border bg-card shadow-soft">
          {suggestions.map((user, index) => (
            <button
              key={user._id}
              type="button"
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                index === activeIndex ? "bg-secondary" : "hover:bg-secondary"
              }`}
              onClick={() => insertMention(user)}
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block truncate font-medium">{user.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MentionComposer = memo(MentionComposerBase);

const CollaborationSidebar = ({ documentId, pendingAnchor, onThreadCreated }) => {
  const communication = useCommunicationSocket(documentId);
  const [messages, setMessages] = useState([]);
  const [threads, setThreads] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chatBody, setChatBody] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [replyBodies, setReplyBodies] = useState({});

  useEffect(() => {
    const loadCommunication = async () => {
      const [chatResult, commentResult, notificationResult] = await Promise.all([
        getChatMessages(documentId),
        getCommentThreads(documentId, { status: "all" }),
        getNotifications({ limit: 8 }),
      ]);
      setMessages(chatResult.data || []);
      setThreads(commentResult.data || []);
      setNotifications(notificationResult.data || []);
    };
    loadCommunication();
  }, [documentId]);

  useEffect(() => {
    if (communication.liveMessages.length) {
      setMessages((items) => {
        const seen = new Set(items.map((item) => item._id));
        return [...items, ...communication.liveMessages.filter((item) => !seen.has(item._id))];
      });
    }
  }, [communication.liveMessages]);

  useEffect(() => {
    if (communication.liveThreads.length) {
      setThreads((items) => {
        const map = new Map(items.map((thread) => [thread._id, thread]));
        communication.liveThreads.forEach((thread) => map.set(thread._id, { ...map.get(thread._id), ...thread }));
        return Array.from(map.values()).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });
    }
  }, [communication.liveThreads]);

  useEffect(() => {
    if (communication.notifications.length) {
      setNotifications((items) => [...communication.notifications, ...items]);
    }
  }, [communication.notifications]);

  const openThreads = useMemo(() => threads.filter((thread) => thread.status !== "resolved"), [threads]);
  const resolvedThreads = useMemo(() => threads.filter((thread) => thread.status === "resolved"), [threads]);

  const submitChat = () => {
    if (!chatBody.trim()) return;
    communication.sendChatMessage({ body: chatBody.trim(), clientId: crypto.randomUUID() });
    setChatBody("");
    communication.sendTyping(false);
  };

  const submitComment = () => {
    if (!commentBody.trim() || !pendingAnchor) return;
    const clientId = crypto.randomUUID();
    communication.createThread({ body: commentBody.trim(), anchor: pendingAnchor, clientId });
    onThreadCreated?.(pendingAnchor, clientId);
    setCommentBody("");
  };

  const submitReply = (threadId) => {
    const body = replyBodies[threadId]?.trim();
    if (!body) return;
    communication.createReply({ threadId, body, clientId: crypto.randomUUID() });
    setReplyBodies((items) => ({ ...items, [threadId]: "" }));
  };

  const markAllRead = async () => {
    const result = await markNotificationsRead();
    setNotifications(result.data || []);
  };

  return (
    <aside className="rounded-lg border border-border bg-card shadow-soft">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Collaboration</p>
            <p className="text-xs text-muted-foreground">{communication.onlineUsers.length} online in this document</p>
          </div>
          <Badge variant="accent">Live</Badge>
        </div>
        <div className="mt-3 flex -space-x-2">
          {communication.onlineUsers.slice(0, 5).map((user) => (
            <Avatar key={user._id} className="h-8 w-8 border-2 border-card">
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      <Tabs defaultValue="chat" className="p-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat"><MessageCircle className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="comments"><MessageSquare className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4" /></TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-3">
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {messages.map((message) => (
              <div key={message._id || message.clientId} className="flex gap-2">
                <Avatar className="h-8 w-8"><AvatarFallback>{initials(message.author?.name)}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1 rounded-md bg-secondary/70 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{message.author?.name || "Teammate"}</p>
                    <span className="text-[11px] text-muted-foreground">{formatTime(message.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{renderBody(message.body)}</p>
                </div>
              </div>
            ))}
          </div>
          {communication.typingUsers.length > 0 && (
            <p className="text-xs text-muted-foreground">{communication.typingUsers.map((user) => user.name).join(", ")} typing...</p>
          )}
          <MentionComposer
            documentId={documentId}
            value={chatBody}
            onChange={(value) => {
              setChatBody(value);
              communication.sendTyping(Boolean(value));
            }}
            onSubmit={submitChat}
            placeholder="Message this document..."
          />
          <Button type="button" className="w-full" onClick={submitChat}><Send className="h-4 w-4" />Send</Button>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <div className="rounded-md border border-border bg-background p-3">
            <p className="text-sm font-medium">New inline comment</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {pendingAnchor?.text || "Select text in the editor, then use the comment icon in the floating menu."}
            </p>
            <div className="mt-3 space-y-2">
              <MentionComposer documentId={documentId} value={commentBody} onChange={setCommentBody} onSubmit={submitComment} placeholder="Add a comment..." />
              <Button type="button" size="sm" disabled={!pendingAnchor || !commentBody.trim()} onClick={submitComment}>Comment</Button>
            </div>
          </div>

          {[...openThreads, ...resolvedThreads].map((thread) => (
            <div key={thread._id} className="rounded-md border border-border bg-background p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge variant={thread.status === "resolved" ? "secondary" : "accent"}>{thread.status}</Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => (thread.status === "resolved" ? communication.reopenThread(thread._id) : communication.resolveThread(thread._id))}
                >
                  {thread.status === "resolved" ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  {thread.status === "resolved" ? "Reopen" : "Resolve"}
                </Button>
              </div>
              <p className="mb-3 border-l-2 border-accent pl-2 text-xs text-muted-foreground">{thread.anchor?.text || "Detached selection"}</p>
              <div className="space-y-2">
                {(thread.comments || []).map((comment) => (
                  <div key={comment._id} className="rounded-md bg-secondary/60 p-2">
                    <p className="text-xs font-medium">{comment.author?.name || "Teammate"}</p>
                    <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{renderBody(comment.body)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                <MentionComposer
                  documentId={documentId}
                  value={replyBodies[thread._id] || ""}
                  onChange={(value) => setReplyBodies((items) => ({ ...items, [thread._id]: value }))}
                  onSubmit={() => submitReply(thread._id)}
                  placeholder="Reply..."
                  minRows={1}
                />
                <Button type="button" size="sm" variant="outline" onClick={() => submitReply(thread._id)}>Reply</Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-3">
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={markAllRead}>Mark all read</Button>
          {notifications.slice(0, 20).map((notification) => (
            <div key={notification._id} className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 text-accent" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{notification.body || notification.document?.title}</p>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </aside>
  );
};

export default memo(CollaborationSidebar);
