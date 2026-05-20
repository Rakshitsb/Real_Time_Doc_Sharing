import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Italic, Link, MessageSquarePlus, Sparkles, Underline } from "lucide-react";
import { Button } from "../ui/button";

const EditorBubbleMenu = ({ editor, onCreateCommentAnchor, onOpenAi }) => {
  if (!editor) return null;

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }}>
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-soft">
        <Button size="icon" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Underline className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" type="button" onClick={() => editor.chain().focus().unsetLink().run()}>
          <Link className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" type="button" onClick={() => onCreateCommentAnchor?.(editor)}>
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" type="button" onClick={() => onOpenAi?.("improve")}>
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>
    </BubbleMenu>
  );
};

export default EditorBubbleMenu;
