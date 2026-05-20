import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ErrorMessage from "../components/common/ErrorMessage";
import PageTransition from "../components/common/PageTransition";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { getDocumentPath } from "../constants/routes";
import DashboardLayout from "../layouts/DashboardLayout";
import { createDocument } from "../services/documentService";
import getErrorMessage from "../utils/getErrorMessage";

const DocumentFormPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await createDocument({ title, content });
      toast.success("Document created");
      navigate(getDocumentPath(data._id), {
        state: { message: "Document created successfully!" },
      });
    } catch (createError) {
      setError(getErrorMessage(createError, "Failed to create document"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Create document" subtitle="Start a clean document that can later support rich editing.">
      <PageTransition className="mx-auto max-w-3xl">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>New document</CardTitle>
            <CardDescription>Plain text today, structured editor-ready foundation tomorrow.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <ErrorMessage message={error} />
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" value={content} onChange={(event) => setContent(event.target.value)} required />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create document"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </PageTransition>
    </DashboardLayout>
  );
};

export default DocumentFormPage;
