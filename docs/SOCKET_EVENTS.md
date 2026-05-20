# Socket Event Documentation

Socket connections require a JWT in `handshake.auth.token` or `Authorization: Bearer <token>`.

## Collaboration Events

- `collaboration:join` joins a protected Yjs document room.
- `collaboration:sync-state` sends the current encoded Yjs state and awareness state to the joining client.
- `collaboration:update` sends encoded Yjs document updates.
- `collaboration:awareness-update` sends cursor/presence awareness updates. Client and server throttle this path.
- `collaboration:presence` broadcasts lightweight collaborator presence.
- `collaboration:leave` leaves and cleans up the room.
- `collaboration:error` returns permission or sync errors.

## Communication Events

- `communication:join` joins a protected chat/comment room.
- `communication:online-users` broadcasts active users in the document.
- `communication:chat-typing` sends throttled typing state.
- `communication:chat-message-create` creates and broadcasts chat messages.
- `communication:comment-thread-create` creates inline comment threads.
- `communication:comment-reply-create` creates replies.
- `communication:comment-thread-resolve` resolves a thread.
- `communication:comment-thread-reopen` reopens a thread.
- `communication:error` returns communication failures.

## Scaling Notes

The current in-memory Yjs room store is appropriate for a single backend instance. For multi-instance production, add the Socket.IO Redis adapter and move room/presence coordination into Redis or another shared store while keeping MongoDB as the durable document/history system.
