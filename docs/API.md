# API Documentation

Base URL: `/api`

## Health

- `GET /health` returns service status and uptime.

## Auth

- `POST /auth/register` creates a user.
- `POST /auth/login` returns a JWT.

## AI

All AI routes require `Authorization: Bearer <token>` and are protected by an AI-specific rate limit.

- `POST /ai/actions` runs a writing action such as summarize, improve, rewrite, continue, action items, or brainstorm.
- `POST /ai/chat` asks the document-aware AI assistant a question.

## Documents

All document routes require `Authorization: Bearer <token>`.

- `GET /documents?page=1&limit=20` lists accessible documents.
- `POST /documents` creates a document.
- `GET /documents/:id` returns one accessible document.
- `PUT /documents/:id` updates title/content.
- `DELETE /documents/:id` soft-deletes a document.

## Sharing

- `GET /documents/:id/sharing` returns owner, collaborators, invites, visibility, and caller access.
- `GET /documents/:id/sharing/users/search?q=email` searches registered users for invites.
- `POST /documents/:id/sharing/invite` invites a user by email with `viewer`, `commenter`, or `editor` role.
- `PATCH /documents/:id/collaborators/:collaboratorId` updates a collaborator role.
- `DELETE /documents/:id/collaborators/:collaboratorId` removes a collaborator.
- `PATCH /documents/:id/sharing/visibility` changes `private`, `collaborators-only`, or `public-readonly` visibility.

## Version History

- `GET /documents/:id/versions` lists lightweight version metadata.
- `GET /documents/:id/versions/:versionId` loads a full version.
- `POST /documents/:id/versions/:versionId/restore` restores a version.

## Communication

- `GET /documents/:id/chat` lists chat messages.
- `POST /documents/:id/chat` creates a chat message.
- `GET /documents/:id/comments?status=all` lists comment threads.
- `POST /documents/:id/comments` creates a thread.
- `POST /documents/:id/comments/:threadId/replies` adds a reply.
- `POST /documents/:id/comments/:threadId/resolve` resolves a thread.
- `POST /documents/:id/comments/:threadId/reopen` reopens a thread.
- `GET /documents/:id/mentions/search?q=name` searches mentionable users.

## Notifications

- `GET /notifications` lists notifications.
- `POST /notifications/read` marks notifications as read.
