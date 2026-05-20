import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useMemo, useRef, useState } from "react";
import AIActionDialog from "../../ai/modals/AIActionDialog";
import { Badge } from "../ui/badge";
import createEditorExtensions from "./extensions/editorExtensions";
import EditorBubbleMenu from "./EditorBubbleMenu";
import EditorFloatingMenu from "./EditorFloatingMenu";
import EditorToolbar from "./EditorToolbar";
import { normalizeEditorContent } from "./utils/content";
import "./styles/editor.css";

const Editor = ({
  content,
  onChange,
  saveStatus = "saved",
  collaborationProvider,
  collaborationReady = true,
  collaborationUser,
  forceContentRevision = 0,
  onCreateCommentAnchor,
  editable = true,
}) => {
  const appliedForceRevisionRef = useRef(0);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiInitialAction, setAiInitialAction] = useState("improve");
  const [aiContext, setAiContext] = useState({ documentText: "", selectedText: "" });
  const extensions = useMemo(
    () => createEditorExtensions({ collaborationProvider, collaborationUser }),
    [collaborationProvider, collaborationUser]
  );

  const editor = useEditor({
    extensions,
    content: collaborationProvider ? undefined : normalizeEditorContent(content),
    editorProps: {
      attributes: {
        class: "max-w-none text-base text-foreground",
      },
    },
    editable,
    onUpdate: ({ editor: activeEditor }) => {
      onChange(activeEditor.getJSON());
    },
  });

  useEffect(() => {
    if (editor) editor.setEditable(editable);
  }, [editable, editor]);

  useEffect(() => {
    if (!editor || !content) return;

    const nextContent = normalizeEditorContent(content);

    if (collaborationProvider) {
      if (!collaborationReady) return;

      if (forceContentRevision > appliedForceRevisionRef.current) {
        appliedForceRevisionRef.current = forceContentRevision;
        editor.commands.setContent(nextContent, true);
        return;
      }

      const yFragment = collaborationProvider.document.getXmlFragment("default");
      if (yFragment.length === 0 && editor.isEmpty) {
        editor.commands.setContent(nextContent, true);
      }
      return;
    }

    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(nextContent)) {
      editor.commands.setContent(nextContent, false);
    }
  }, [collaborationProvider, collaborationReady, content, editor, forceContentRevision]);

  const statusLabel = {
    saving: "Saving...",
    saved: "Saved",
    error: "Autosave error",
  }[saveStatus];

  const captureAiContext = (action = "improve") => {
    if (!editor) return;
    const { from, to, empty } = editor.state.selection;
    const selectedText = empty ? "" : editor.state.doc.textBetween(from, to, " ").trim();
    setAiInitialAction(selectedText ? action : action === "improve" ? "summarize_short" : action);
    setAiContext({
      documentText: editor.getText(),
      selectedText,
    });
    setAiDialogOpen(true);
  };

  const applyAiResult = (text, action) => {
    if (!editor) return;
    const chain = editor.chain().focus();

    if (action?.mode === "replace" && aiContext.selectedText) {
      chain.insertContent(text).run();
      return;
    }

    chain.insertContent(`${text}\n`).run();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium">Rich document editor</p>
          <p className="text-xs text-muted-foreground">Structured JSON content, ready for collaboration later.</p>
        </div>
        <Badge variant={saveStatus === "error" ? "outline" : "accent"}>{statusLabel}</Badge>
      </div>
      <EditorToolbar editor={editor} onOpenAi={captureAiContext} disabled={!editable} />
      <div className="doczz-editor bg-background">
        {editable && (
          <>
            <EditorBubbleMenu editor={editor} onCreateCommentAnchor={onCreateCommentAnchor} onOpenAi={captureAiContext} />
            <EditorFloatingMenu editor={editor} onOpenAi={captureAiContext} />
          </>
        )}
        <EditorContent editor={editor} />
      </div>
      <AIActionDialog
        documentText={aiContext.documentText}
        selectedText={aiContext.selectedText}
        initialAction={aiInitialAction}
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onApply={applyAiResult}
      />
    </div>
  );
};

export default Editor;
