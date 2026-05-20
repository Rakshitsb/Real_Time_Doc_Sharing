import { useState } from "react";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import useAiChat from "../hooks/useAiChat";
import { cn } from "../../utils/cn";

const AIAssistantPanel = ({ documentText, selectedText }) => {
  const [message, setMessage] = useState("");
  const chat = useAiChat();

  const submit = () => {
    const nextMessage = message.trim();
    if (!nextMessage) return;
    chat.sendMessage({ message: nextMessage, documentText, selectedText });
    setMessage("");
  };

  return (
    <aside className="rounded-lg border border-border bg-card shadow-soft">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI assistant</p>
            <p className="text-xs text-muted-foreground">Ask about this document</p>
          </div>
        </div>
      </div>

      <div className="max-h-[320px] space-y-3 overflow-y-auto p-4">
        {chat.messages.length === 0 && (
          <div className="rounded-md border border-dashed border-border bg-background p-3 text-sm text-muted-foreground">
            <Sparkles className="mb-2 h-4 w-4 text-accent" />
            Try asking for risks, action items, a simpler explanation, or a better structure.
          </div>
        )}

        {chat.messages.map((item) => (
          <div
            key={item.id}
            className={cn(
              "rounded-md px-3 py-2 text-sm",
              item.role === "user" ? "ml-8 bg-accent text-accent-foreground" : "mr-8 bg-secondary text-foreground",
              item.error && "border border-destructive/30 bg-destructive/10 text-destructive"
            )}
          >
            <p className="whitespace-pre-wrap">{item.content}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-border p-4">
        <Textarea
          className="min-h-[78px] resize-none"
          value={message}
          placeholder="Ask AI about this document..."
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              submit();
            }
          }}
        />
        <Button type="button" className="w-full" onClick={submit} disabled={chat.isSending || !message.trim()}>
          {chat.isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Ask AI
        </Button>
      </div>
    </aside>
  );
};

export default AIAssistantPanel;
