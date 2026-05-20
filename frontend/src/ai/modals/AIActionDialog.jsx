import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import AICommandMenu from "../components/AICommandMenu";
import useAiAction from "../hooks/useAiAction";
import { getAiAction } from "../utils/aiActions";

const AIActionDialog = ({ documentText, selectedText, open, onOpenChange, onApply, initialAction = "improve" }) => {
  const [activeAction, setActiveAction] = useState(initialAction);
  const [preview, setPreview] = useState("");
  const { error, execute, isRunning, reset } = useAiAction();
  const action = useMemo(() => getAiAction(activeAction), [activeAction]);
  const hasSelection = Boolean(selectedText?.trim());

  useEffect(() => {
    if (open) {
      setActiveAction(initialAction);
      setPreview("");
      reset();
    }
  }, [initialAction, open, reset]);

  const runAction = async (nextAction = action) => {
    if (!nextAction) return;
    setActiveAction(nextAction.id);
    const response = await execute({
      action: nextAction.id,
      selectedText,
      documentText,
    });

    if (response?.result) {
      setPreview(response.result);
    }
  };

  const applyResult = () => {
    if (!preview.trim()) return;
    onApply(preview, action);
    toast.success(action?.mode === "replace" ? "AI rewrite applied" : "AI result inserted");
    onOpenChange(false);
  };

  const copyResult = async () => {
    if (!preview.trim()) return;
    await navigator.clipboard.writeText(preview);
    toast.success("AI result copied");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            AI writing assistant
          </DialogTitle>
          <DialogDescription>
            Run focused AI actions on the current document or selected text, then preview before applying.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <AICommandMenu activeAction={activeAction} hasSelection={hasSelection} onSelect={runAction} />

          <section className="space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source</p>
              <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                {selectedText || documentText || "No document text available yet."}
              </p>
            </div>

            <Textarea
              className="min-h-[220px] resize-none"
              placeholder="AI output will appear here..."
              value={preview}
              onChange={(event) => setPreview(event.target.value)}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => runAction(action)} disabled={isRunning}>
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate
              </Button>
              <Button type="button" variant="outline" onClick={copyResult} disabled={!preview.trim()}>
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button type="button" onClick={applyResult} disabled={!preview.trim()}>
                <Check className="h-4 w-4" />
                {action?.mode === "replace" ? "Replace selection" : "Insert"}
              </Button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIActionDialog;
