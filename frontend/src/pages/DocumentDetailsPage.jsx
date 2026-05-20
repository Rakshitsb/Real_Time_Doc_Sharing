import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Clock, Save, Trash2, Users } from "lucide-react";
import AIAssistantPanel from "../ai/components/AIAssistantPanel";
import ShareDocumentDialog from "../components/collaboration/ShareDocumentDialog";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingState from "../components/common/LoadingState";
import PageTransition from "../components/common/PageTransition";
import Editor from "../components/editor/Editor";
import useDebouncedAutosave from "../components/editor/hooks/useDebouncedAutosave";
import { getPlainTextFromJson, getTextLengthFromJson, normalizeEditorContent } from "../components/editor/utils/content";
import VersionHistoryPanel from "../components/editor/VersionHistoryPanel";
import CollaboratorPresence from "../collaboration/awareness/CollaboratorPresence";
import useCollaborationProvider from "../collaboration/hooks/useCollaborationProvider";
import CollaborationSidebar from "../components/collaboration/CollaborationSidebar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ROUTES } from "../constants/routes";
import useDocumentSocket from "../hooks/useDocumentSocket";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  deleteDocument,
  getDocumentById,
  updateDocument,
} from "../services/documentService";
import getErrorMessage from "../utils/getErrorMessage";

const DocumentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");
  const [isSaving, setIsSaving] = useState(false);
  const [restoreRevision, setRestoreRevision] = useState(0);
  const [pendingCommentAnchor, setPendingCommentAnchor] = useState(null);
  const collaboration = useCollaborationProvider(id);
  const access = document?.access || {};
  const canEdit = access.canEdit !== false;
  const canShare = Boolean(access.canShare);
  const aiDocumentText = useMemo(() => {
    const body = getPlainTextFromJson(content);
    return [title, body].filter(Boolean).join("\n\n");
  }, [content, title]);

  const handleRemoteUpdate = useCallback((updatedData) => {
    if (typeof updatedData.title === "string") {
      setTitle(updatedData.title);
    }

    if (typeof updatedData.content === "string" || typeof updatedData.content === "object") {
      setContent(normalizeEditorContent(updatedData.content));
    }

    if (updatedData.restored) {
      setRestoreRevision((revision) => revision + 1);
      setSuccessMessage("Document restored from version history");
    }
  }, []);

  const { sendDocumentUpdate } = useDocumentSocket(id, handleRemoteUpdate);

  const saveDocument = useCallback(
    async (nextContent = content) => {
      await updateDocument(id, { title, content: nextContent });
    },
    [content, id, title]
  );

  const { status: saveStatus, markSaved } = useDebouncedAutosave({
    value: content,
    enabled: Boolean(document && content && canEdit),
    onSave: saveDocument,
    delay: 1400,
  });

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const doc = await getDocumentById(id);
        const normalizedContent = normalizeEditorContent(doc.content);
        setDocument(doc);
        setTitle(doc.title);
        setContent(normalizedContent);
        markSaved(normalizedContent);
      } catch (fetchError) {
        setError(getErrorMessage(fetchError, "Failed to fetch document"));
      }
    };

    fetchDocument();
  }, [id, markSaved]);

  const handleUpdate = async () => {
    setError("");
    setIsSaving(true);

    try {
      await saveDocument(content);
      sendDocumentUpdate({ title, content });
      setSuccessMessage("Document updated successfully!");
      toast.success("Document saved");
      markSaved(content);
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Failed to update document"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(id);
      toast.success("Document deleted");
      navigate(ROUTES.DASHBOARD);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Failed to delete document"));
    }
  };

  const handleTitleChange = (event) => {
    if (!canEdit) return;
    const nextTitle = event.target.value;
    setTitle(nextTitle);
    sendDocumentUpdate({ title: nextTitle, content });
  };

  const handleContentChange = (nextContent) => {
    if (!canEdit) return;
    setContent(nextContent);
  };

  const handleVersionRestored = (restoredDocument) => {
    const normalizedContent = normalizeEditorContent(restoredDocument.content);
    setDocument(restoredDocument);
    setTitle(restoredDocument.title);
    setContent(normalizedContent);
    setRestoreRevision((revision) => revision + 1);
    markSaved(normalizedContent);
  };

  const handleCreateCommentAnchor = (editor) => {
    if (!canEdit) return;
    const { from, to, empty } = editor.state.selection;
    if (empty) {
      toast.error("Select text before adding an inline comment");
      return;
    }

    const clientId = crypto.randomUUID();
    const text = editor.state.doc.textBetween(from, to, " ").trim();
    const anchor = {
      type: "text-range",
      from,
      to,
      text,
      clientId,
      fallbackPath: [],
      deletedText: false,
    };

    editor.chain().focus().setCommentAnchor({ threadId: clientId, status: "open" }).run();
    setPendingCommentAnchor(anchor);
  };

  const handleThreadCreated = () => {
    setPendingCommentAnchor(null);
  };

  if (!document && !error) {
    return (
      <DashboardLayout title="Opening document" subtitle="Preparing your workspace.">
        <LoadingState message="Loading document..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={title || "Document"} subtitle="Edit text now. Rich collaboration panels can attach to this page later.">
      <PageTransition className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">Realtime preview</Badge>
              {successMessage && <Badge variant="secondary">{successMessage}</Badge>}
            </div>
            <div className="flex gap-2">
              <ShareDocumentDialog documentId={id} disabled={!canShare} onSharingChanged={(sharing) => setDocument((doc) => ({ ...doc, ...sharing }))} />
              <Button type="button" onClick={handleUpdate} disabled={isSaving || !canEdit}>
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button variant="destructive" type="button" onClick={handleDelete} disabled={!canShare}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <ErrorMessage message={error} />

          <Card className="shadow-soft">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" className="h-12 text-lg font-semibold" value={title} onChange={handleTitleChange} disabled={!canEdit} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Editor
                  collaborationProvider={collaboration.provider}
                  collaborationReady={collaboration.isSynced}
                  collaborationUser={collaboration.user}
                  content={content}
                  forceContentRevision={restoreRevision}
                  onCreateCommentAnchor={handleCreateCommentAnchor}
                  onChange={handleContentChange}
                  saveStatus={saveStatus}
                  editable={canEdit}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <CollaborationSidebar
            documentId={id}
            pendingAnchor={pendingCommentAnchor}
            onThreadCreated={handleThreadCreated}
          />

          <AIAssistantPanel documentText={aiDocumentText} selectedText="" />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Workspace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CollaboratorPresence
                collaborators={collaboration.collaborators}
                connectionStatus={collaboration.connectionStatus}
              />
              <p className="text-sm text-muted-foreground">
                Your role is {access.role || "viewer"}. {canEdit ? "Live editing is enabled." : "This document is read-only for you."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Document details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="meta">
                <TabsList className="w-full">
                  <TabsTrigger className="flex-1" value="meta">Meta</TabsTrigger>
                  <TabsTrigger className="flex-1" value="future">Future</TabsTrigger>
                </TabsList>
                <TabsContent value="meta" className="space-y-2 text-sm text-muted-foreground">
                  <p>Created {document?.createdAt ? new Date(document.createdAt).toLocaleDateString() : "recently"}</p>
                  <p>{getTextLengthFromJson(content)} characters</p>
                </TabsContent>
                <TabsContent value="future" className="text-sm text-muted-foreground">
                  Version history, export, and comments belong here later.
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <VersionHistoryPanel documentId={id} onRestored={handleVersionRestored} />
        </aside>
      </PageTransition>
    </DashboardLayout>
  );
};

export default DocumentDetailsPage;
