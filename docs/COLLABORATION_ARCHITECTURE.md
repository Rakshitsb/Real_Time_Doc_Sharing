# Collaboration Architecture

Realtime editing uses Yjs for CRDT state and Socket.IO as the transport. Each document gets a collaboration room named `document:<documentId>:collaboration`.

## Join Flow

1. The socket authenticates with JWT middleware.
2. The server verifies document access before allowing the room join.
3. The server creates or reuses the in-memory Yjs room.
4. The client receives `collaboration:sync-state` with encoded document and awareness state.
5. Subsequent Yjs updates are applied locally and relayed to other room members.

## Optimization Strategy

- Route-level code splitting keeps initial frontend load smaller.
- Editor dependencies are split into a separate build chunk.
- Autosave is debounced to prevent unnecessary writes.
- Awareness and typing events are throttled because they are high-frequency and lossy by nature.
- Yjs updates use volatile socket emits where safe to reduce backlog pressure during poor connections.
- MongoDB reads use projections, pagination, lean queries, and compound indexes.
- Version lists avoid loading full historical content until a specific version is requested.

## Security Strategy

- HTTP routes use JWT auth, validation, sanitization, CORS, Helmet, compression, and rate limiting.
- Socket connections use JWT auth and per-document permission checks before room joins.
- Unauthorized realtime joins receive socket errors and do not enter rooms.
- Secrets are loaded from environment variables and production refuses default secrets.

## Monitoring Strategy

Structured logs are emitted for HTTP requests, API errors, socket connections, socket errors, and selected collaboration events. This can be connected to Sentry, LogRocket, Datadog, or a cloud log drain without changing business logic.
