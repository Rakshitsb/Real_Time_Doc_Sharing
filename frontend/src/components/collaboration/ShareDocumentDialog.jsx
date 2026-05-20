import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Copy, Link2, Loader2, Search, Share2, Trash2, UserPlus } from "lucide-react";
import ErrorMessage from "../common/ErrorMessage";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
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
import {
  getDocumentSharing,
  inviteCollaborator,
  removeCollaborator,
  searchShareUsers,
  updateCollaboratorRole,
  updateDocumentVisibility,
} from "../../services/shareService";
import getErrorMessage from "../../utils/getErrorMessage";

const roles = ["viewer", "editor", "commenter"];
const visibilities = [
  { value: "private", label: "Private" },
  { value: "collaborators-only", label: "Collaborators only" },
  { value: "public-readonly", label: "Public read-only" },
];

const initials = (name = "User") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const ShareDocumentDialog = ({ documentId, disabled, onSharingChanged }) => {
  const [open, setOpen] = useState(false);
  const [sharing, setSharing] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("viewer");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !documentId) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        setSharing(await getDocumentSharing(documentId));
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Unable to load sharing settings"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [documentId, open]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setSuggestions([]);
      return undefined;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setSuggestions(await searchShareUsers(documentId, query));
      } catch {
        setSuggestions([]);
      }
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [documentId, open, query]);

  const updateSharing = (nextSharing) => {
    setSharing(nextSharing);
    onSharingChanged?.(nextSharing);
  };

  const handleInvite = async () => {
    const email = (selectedEmail || query).trim().toLowerCase();
    if (!email) return;

    setLoading(true);
    setError("");
    try {
      updateSharing(await inviteCollaborator(documentId, { email, role: selectedRole }));
      setQuery("");
      setSelectedEmail("");
      setSuggestions([]);
      toast.success("Collaborator invited");
    } catch (inviteError) {
      setError(getErrorMessage(inviteError, "Unable to invite collaborator"));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (collaboratorId, role) => {
    updateSharing(await updateCollaboratorRole(documentId, collaboratorId, role));
    toast.success("Role updated");
  };

  const handleRemove = async (collaboratorId) => {
    updateSharing(await removeCollaborator(documentId, collaboratorId));
    toast.success("Collaborator removed");
  };

  const handleVisibility = async (visibility) => {
    updateSharing(await updateDocumentVisibility(documentId, visibility));
    toast.success("Visibility updated");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Share link copied");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share document</DialogTitle>
          <DialogDescription>Invite teammates and manage who can view or edit this document.</DialogDescription>
        </DialogHeader>

        <ErrorMessage message={error} />

        {loading && !sharing ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading sharing settings...
          </div>
        ) : (
          <div className="space-y-5">
            <section className="rounded-md border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Invite people</p>
                  <p className="text-xs text-muted-foreground">Search registered users by name or email.</p>
                </div>
                <Badge variant="outline">{sharing?.access?.role || "viewer"}</Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_130px_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={query}
                    placeholder="teammate@company.com"
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setSelectedEmail("");
                    }}
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-md border border-border bg-card shadow-soft">
                      {suggestions.map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary"
                          onClick={() => {
                            setQuery(`${user.name} <${user.email}>`);
                            setSelectedEmail(user.email);
                            setSuggestions([]);
                          }}
                        >
                          <Avatar className="h-7 w-7"><AvatarFallback>{initials(user.name)}</AvatarFallback></Avatar>
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{user.name}</span>
                            <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value)}
                >
                  {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
                <Button type="button" onClick={handleInvite} disabled={loading || !query.trim()}>
                  <UserPlus className="h-4 w-4" />
                  Invite
                </Button>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>People with access</Label>
                <Button type="button" size="sm" variant="ghost" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                  Copy link
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-md border border-border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback>{initials(sharing?.owner?.name)}</AvatarFallback></Avatar>
                    <div>
                      <p className="text-sm font-medium">{sharing?.owner?.name || "Owner"}</p>
                      <p className="text-xs text-muted-foreground">{sharing?.owner?.email}</p>
                    </div>
                  </div>
                  <Badge variant="accent">owner</Badge>
                </div>

                {(sharing?.collaborators || []).map((collaborator) => (
                  <div key={collaborator.user?._id || collaborator.user} className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar><AvatarFallback>{initials(collaborator.user?.name)}</AvatarFallback></Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{collaborator.user?.name || "Collaborator"}</p>
                        <p className="truncate text-xs text-muted-foreground">{collaborator.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                        value={collaborator.role}
                        onChange={(event) => handleRoleChange(collaborator.user._id, event.target.value)}
                      >
                        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                      <Button type="button" size="icon" variant="ghost" onClick={() => handleRemove(collaborator.user._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-border bg-background p-4">
              <div className="mb-3 flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <Label>General access</Label>
              </div>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={sharing?.visibility || "private"}
                onChange={(event) => handleVisibility(event.target.value)}
              >
                {visibilities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareDocumentDialog;
