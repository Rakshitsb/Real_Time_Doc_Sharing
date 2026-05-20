import { useState } from "react";
import { Plus } from "lucide-react";
import ErrorMessage from "../common/ErrorMessage";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { createDocument } from "../../services/documentService";
import getErrorMessage from "../../utils/getErrorMessage";

const CreateDocumentDialog = ({ onCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const document = await createDocument({ title, content });
      setTitle("");
      setContent("");
      setIsOpen(false);
      onCreated?.(document);
    } catch (createError) {
      setError(getErrorMessage(createError, "Failed to create document"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create document</DialogTitle>
          <DialogDescription>Start with a title and plain text content. Rich editing can plug in later.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <ErrorMessage message={error} />
          <div className="space-y-2">
            <Label htmlFor="dialog-title">Title</Label>
            <Input id="dialog-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dialog-content">Content</Label>
            <Textarea id="dialog-content" value={content} onChange={(event) => setContent(event.target.value)} required />
          </div>
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create document"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDocumentDialog;
