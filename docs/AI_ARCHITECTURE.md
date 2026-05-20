# AI Architecture

The AI layer turns the app into an AI-powered collaborative workspace without changing the editor, Socket.IO, or Yjs architecture.

## Backend Structure

- `server/ai/providers` contains provider adapters. The current adapter calls OpenAI through HTTPS and can be swapped for Gemini, Claude, or local models later.
- `server/ai/prompts` stores centralized prompt templates for summarization, rewriting, generation, and document Q&A.
- `server/ai/services` builds context-aware requests, invokes providers, tracks usage metadata, and returns normalized responses.
- `server/ai/controllers` and `server/ai/routes` expose protected endpoints.
- `server/ai/validators` validates action names and caps text sizes.
- `server/ai/utils` trims document context to control latency and cost.

## Frontend Structure

- `src/ai/services` calls backend AI endpoints.
- `src/ai/hooks` manages action and chat request state.
- `src/ai/modals` contains the AI preview workflow.
- `src/ai/components` contains the command menu and document assistant panel.
- `src/ai/utils` defines reusable AI action metadata.

## Prompt Strategy

Prompts are centralized and action-driven. The frontend sends only the requested action, selected text, and document context. The backend chooses the system prompt, trims context, applies output limits, and keeps provider details private.

## Security

- AI endpoints require JWT authentication.
- AI endpoints use a separate rate limiter.
- Request bodies are validated and stripped of unknown fields.
- Provider secrets live only in backend environment variables.
- Context windows are capped to reduce abuse and cost.

## UX Flow

Users can open AI from the editor toolbar, selected-text bubble menu, or empty-line floating menu. AI output appears in a preview modal before insertion or replacement. The assistant sidebar answers questions about the current document context.

## Current Limitation

The UI is asynchronous and non-blocking, but it does not yet use true server-sent streaming. The provider boundary is ready for streaming to be added later without changing editor integration.
