import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Highlighter,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Rows3,
  Sparkles,
  Strikethrough,
  Table,
  Underline,
  Undo2,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../utils/cn";

const ToolbarButton = ({ active, disabled, label, icon: Icon, onClick }) => (
  <Button
    aria-label={label}
    className={cn("h-9 w-9", active && "bg-secondary text-foreground")}
    size="icon"
    type="button"
    variant={active ? "secondary" : "ghost"}
    disabled={disabled}
    onClick={onClick}
  >
    <Icon className="h-4 w-4" />
  </Button>
);

const Divider = () => <div className="mx-1 h-6 w-px bg-border" />;

const EditorToolbar = ({ editor, onOpenAi, disabled = false }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Paste image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  if (disabled) {
    return (
      <div className="sticky top-16 z-20 flex flex-wrap items-center gap-2 border-b border-border bg-card/95 px-3 py-2 text-sm text-muted-foreground backdrop-blur">
        <span>Read-only access</span>
        <ToolbarButton label="AI assistant" icon={Sparkles} onClick={() => onOpenAi?.("summarize_short")} />
      </div>
    );
  }

  return (
    <div className="sticky top-16 z-20 flex flex-wrap items-center gap-1 border-b border-border bg-card/95 px-3 py-2 backdrop-blur">
      <ToolbarButton disabled={disabled} label="Undo" icon={Undo2} onClick={() => editor.chain().focus().undo().run()} />
      <ToolbarButton disabled={disabled} label="Redo" icon={Redo2} onClick={() => editor.chain().focus().redo().run()} />
      <Divider />
      <ToolbarButton disabled={disabled} active={editor.isActive("bold")} label="Bold" icon={Bold} onClick={() => editor.chain().focus().toggleBold().run()} />
      <ToolbarButton active={editor.isActive("italic")} label="Italic" icon={Italic} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <ToolbarButton active={editor.isActive("underline")} label="Underline" icon={Underline} onClick={() => editor.chain().focus().toggleUnderline().run()} />
      <ToolbarButton active={editor.isActive("strike")} label="Strike" icon={Strikethrough} onClick={() => editor.chain().focus().toggleStrike().run()} />
      <ToolbarButton active={editor.isActive("highlight")} label="Highlight" icon={Highlighter} onClick={() => editor.chain().focus().toggleHighlight().run()} />
      <Divider />
      <ToolbarButton active={editor.isActive("heading", { level: 1 })} label="Heading 1" icon={Heading1} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <ToolbarButton active={editor.isActive("heading", { level: 2 })} label="Heading 2" icon={Heading2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <ToolbarButton active={editor.isActive("bulletList")} label="Bullet list" icon={List} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolbarButton active={editor.isActive("orderedList")} label="Ordered list" icon={ListOrdered} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <ToolbarButton active={editor.isActive("blockquote")} label="Quote" icon={Quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <ToolbarButton active={editor.isActive("codeBlock")} label="Code block" icon={Code} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
      <Divider />
      <ToolbarButton label="Align left" icon={AlignLeft} onClick={() => editor.chain().focus().setTextAlign("left").run()} />
      <ToolbarButton label="Align center" icon={AlignCenter} onClick={() => editor.chain().focus().setTextAlign("center").run()} />
      <ToolbarButton label="Align right" icon={AlignRight} onClick={() => editor.chain().focus().setTextAlign("right").run()} />
      <Divider />
      <ToolbarButton active={editor.isActive("link")} label="Link" icon={Link} onClick={setLink} />
      <ToolbarButton label="Image" icon={Image} onClick={addImage} />
      <ToolbarButton label="Table" icon={Table} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
      <ToolbarButton label="Horizontal rule" icon={Rows3} onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      <Divider />
      <ToolbarButton label="AI assistant" icon={Sparkles} onClick={() => onOpenAi?.("improve")} />
    </div>
  );
};

export default EditorToolbar;
