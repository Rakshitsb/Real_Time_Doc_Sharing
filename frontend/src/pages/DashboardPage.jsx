import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Clock, FileText, Plus, Search, Users } from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingState from "../components/common/LoadingState";
import PageTransition from "../components/common/PageTransition";
import CreateDocumentDialog from "../components/editor/CreateDocumentDialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { getDocumentPath, ROUTES } from "../constants/routes";
import DashboardLayout from "../layouts/DashboardLayout";
import { getDocuments } from "../services/documentService";
import getErrorMessage from "../utils/getErrorMessage";
import { getCurrentUser } from "../utils/storage";

const DashboardPage = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user?.token) {
      navigate(ROUTES.HOME);
      return;
    }

    const fetchDocuments = async () => {
      try {
        const data = await getDocuments();
        setDocuments(data);
      } catch (fetchError) {
        setError(getErrorMessage(fetchError, "Failed to fetch documents"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [navigate, user?.token]);

  const handleCreated = (document) => {
    setDocuments((currentDocuments) => [document, ...currentDocuments]);
    toast.success("Document created");
    navigate(getDocumentPath(document._id), {
      state: { message: "Document created successfully!" },
    });
  };

  const filteredDocuments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return documents;
    return documents.filter((doc) => doc.title.toLowerCase().includes(term));
  }, [documents, search]);

  const ownedDocuments = filteredDocuments.filter((doc) => doc.access?.role === "owner");
  const sharedDocuments = filteredDocuments.filter((doc) => doc.access?.role && doc.access.role !== "owner");
  const recentDocuments = filteredDocuments.slice(0, 6);

  const renderDocumentGrid = (items, emptyTitle) =>
    items.length === 0 ? (
      <EmptyState title={emptyTitle} description="Documents matching this section will appear here." />
    ) : (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((doc) => (
          <Card key={doc._id} className="group transition-all hover:-translate-y-0.5 hover:shadow-soft">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <Badge variant={doc.access?.role === "owner" ? "accent" : "outline"}>{doc.access?.role || "viewer"}</Badge>
              </div>
              <CardTitle className="line-clamp-2 pt-2">{doc.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Updated {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
              </div>
              <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {(doc.collaborators || []).length} collaborators
              </div>
              <Button className="w-full" variant="outline" asChild>
                <Link to={getDocumentPath(doc._id)}>Open document</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );

  return (
    <DashboardLayout title="Documents" subtitle={`Welcome ${user?.name || "there"}. Your workspace is ready.`}>
      <PageTransition className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{filteredDocuments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Workspace status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="accent">Active</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Next upgrade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{sharedDocuments.length} shared with you</p>
            </CardContent>
          </Card>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recent documents</h2>
            <p className="text-sm text-muted-foreground">Open, review, or create documents from one place.</p>
          </div>
          <CreateDocumentDialog onCreated={handleCreated} />
        </div>

        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search documents..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>

        <ErrorMessage message={error} />

        {isLoading ? (
          <LoadingState message="Loading documents..." />
        ) : filteredDocuments.length === 0 ? (
          <EmptyState
            title="No documents yet"
            description="Create your first shared document and it will appear in this workspace."
            actionLabel="Create document"
            onAction={() => navigate(ROUTES.NEW_DOCUMENT)}
          />
        ) : (
          <div className="space-y-8">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Recent collaborations</h2>
              {renderDocumentGrid(recentDocuments, "No recent documents")}
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">My documents</h2>
              {renderDocumentGrid(ownedDocuments, "No owned documents")}
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Shared with me</h2>
              {renderDocumentGrid(sharedDocuments, "No shared documents")}
            </section>
          </div>
        )}

        <Button className="fixed bottom-5 right-5 shadow-soft sm:hidden" size="icon" type="button" onClick={() => navigate(ROUTES.NEW_DOCUMENT)}>
          <Plus className="h-5 w-5" />
        </Button>
      </PageTransition>
    </DashboardLayout>
  );
};

export default DashboardPage;
