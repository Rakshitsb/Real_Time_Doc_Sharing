# Collaboration Permissions Architecture

Documents now use a role-based access model layered over the existing MongoDB, Express, Socket.IO, and Yjs architecture.

## Roles

- `owner`: full access, can edit, delete, share, change roles, and change visibility.
- `editor`: can view, edit, use realtime collaboration, chat, and comments.
- `commenter`: future-ready role for comments without full editing.
- `viewer`: read-only access.

## Document Sharing Model

Each document stores:

- `owner`
- `collaborators[]` with `{ user, role, addedAt, invitedBy }`
- `invitedUsers[]` for audit-friendly invite tracking
- `visibility`: `private`, `collaborators-only`, or `public-readonly`
- `workspaceId` and `shareSettings` for future team workspaces and invite links

The owner is not duplicated into collaborators. Effective access is computed by `documentAccess.service.js`.

## Invite Flow

1. Owner opens the share dialog.
2. Frontend searches registered users by name or email.
3. Owner selects a role and invites the user.
4. Backend validates ownership, validates the user, updates collaborators, records invited user metadata, and sends a notification.
5. The invited user sees the document in "Shared with me".

## Access Validation Flow

HTTP APIs:

- Read APIs require view access.
- Edit APIs require editor or owner access.
- Share/delete APIs require owner access.
- Chat/comment write APIs require commenter, editor, or owner access.

Realtime:

- Socket joins authenticate with JWT.
- Room joins call the same document access service.
- Viewers may join for presence/read-only state, but server ignores Yjs/document mutation events from viewer sockets.
- Communication writes are ignored for viewer sockets.

## Dashboard UX

The dashboard groups documents into:

- Recent collaborations
- My documents
- Shared with me

Each document carries `access` metadata so the frontend can show role badges and permission indicators without guessing.

## Future Extensions

- Expiring invite links using `shareSettings.linkTokenHash`.
- Workspace-level roles using `workspaceId`.
- Transfer ownership.
- Redis-backed permission caching for very large collaboration rooms.
