import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { GitBranch, RotateCcw } from "lucide-react";
import ErrorMessage from "../common/ErrorMessage";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  getDocumentActivities,
  getDocumentVersions,
  restoreDocumentVersion,
} from "../../services/documentService";
import getErrorMessage from "../../utils/getErrorMessage";

const VersionHistoryPanel = ({ documentId, onRestored }) => {
  const [versions, setVersions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      setError("");
      const [versionResult, activityResult] = await Promise.all([
        getDocumentVersions(documentId),
        getDocumentActivities(documentId),
      ]);
      setVersions(versionResult.data || []);
      setActivities(activityResult.data || []);
    } catch (historyError) {
      setError(getErrorMessage(historyError, "Unable to load history"));
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (!documentId) return;
    loadHistory();
  }, [documentId, loadHistory]);

  const handleRestore = async () => {
    if (!selectedVersion) return;

    try {
      setIsRestoring(true);
      const restoredDocument = await restoreDocumentVersion(documentId, selectedVersion._id);
      toast.success(`Restored version ${selectedVersion.versionNumber}`);
      setSelectedVersion(null);
      onRestored?.(restoredDocument);
      loadHistory();
    } catch (restoreError) {
      setError(getErrorMessage(restoreError, "Unable to restore version"));
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="h-4 w-4" />
            Version history
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ErrorMessage message={error} />
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading history...</p>
          ) : versions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No snapshots yet. Versions are created automatically after meaningful edits.</p>
          ) : (
            <div className="max-h-80 space-y-3 overflow-auto pr-1">
              {versions.map((version) => (
                <div key={version._id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">Version {version.versionNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(version.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">{version.reason}</Badge>
                  </div>
                  {version.summary && <p className="mt-2 text-xs text-muted-foreground">{version.summary}</p>}
                  <Button
                    className="mt-3 w-full"
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => setSelectedVersion(version)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activities.slice(0, 6).map((activity) => (
            <div key={activity._id} className="border-l border-border pl-3">
              <p className="text-sm">{activity.type.replace(".", " ")}</p>
              <p className="text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {!activities.length && <p className="text-sm text-muted-foreground">No activity yet.</p>}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedVersion)} onOpenChange={(open) => !open && setSelectedVersion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore version {selectedVersion?.versionNumber}</DialogTitle>
            <DialogDescription>
              The current document will be snapshotted first, then replaced with this version. Active collaborators will receive the restored content.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setSelectedVersion(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? "Restoring..." : "Restore version"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VersionHistoryPanel;
