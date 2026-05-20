import { FloatingMenu } from "@tiptap/react/menus";
import { Heading1, List, Plus, Quote, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

const EditorFloatingMenu = ({ editor, onOpenAi }) => {
  if (!editor) return null;

  return (
    <FloatingMenu editor={editor} tippyOptions={{ duration: 150 }}>
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-soft">
        <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => onOpenAi?.("continue")}>
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>
    </FloatingMenu>
  );
};

export default EditorFloatingMenu;
