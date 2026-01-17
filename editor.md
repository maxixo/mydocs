# Editor Implementation Plan

This plan targets a fully functional collaborative editor with offline caching, indexing, and WebSocket-based real-time sync, aligned to the current codebase structure under `client/src` and `server/src`.

## 1) Scope, Data Model, and Routing
- Define document schema: `id`, `title`, `content`, `updatedAt`, `ownerId`, `workspaceId`.
- Decide routing: `/editor` vs `/editor/:id` with deep links; align sidebar and header breadcrumbs to active doc.
- Define shared event types and payloads in `shared/types.ts` and `shared/events.ts`.
- Add permission checks in `server/src/services/permission.service.ts` for doc access.

## 2) Editor Core + CRDT Binding
- Choose editor engine (TipTap/ProseMirror/Lexical/Slate) and finalize document serialization format.
- Implement editor surface in `client/src/editor/Editor.tsx` and toolbar commands in `client/src/editor/Toolbar.tsx`.
- Bind editor state to Yjs doc in `client/src/collaboration/yjsProvider.ts`.
- Create a sync controller in `client/src/collaboration/syncManager.ts` to orchestrate:
  - local editor changes -> Yjs updates
  - Yjs updates -> editor state
  - awareness + presence updates

## 3) Real-Time Collaboration via WebSockets
- Client connection: implement auth handshake, room join, and reconnect strategy in `client/src/websocket/socket.ts`.
- Server WebSocket entry: authenticate, route to doc/presence channels in `server/src/websocket/index.ts`.
- Document sync:
  - `server/src/websocket/documentSocket.ts` handles Yjs update broadcast and server-side persistence triggers.
  - `client/src/collaboration/yjsProvider.ts` connects to WebSocket provider and applies remote updates.
- Presence:
  - `client/src/collaboration/awareness.ts` manages cursor + user metadata.
  - `server/src/websocket/presenceSocket.ts` broadcasts presence changes.

## 4) Document APIs + Persistence
- Implement REST endpoints in `server/src/api/document.routes.ts`:
  - GET `/api/documents` list
  - POST `/api/documents` create
  - GET `/api/documents/:id` fetch
  - PATCH `/api/documents/:id` metadata updates
- Implement DB operations in `server/src/services/document.service.ts`.
- Map DB results in `server/src/models/document.model.ts`.
- Persist CRDT snapshots in `server/src/collaboration/persistence.ts`:
  - load doc state at connect
  - save snapshots on interval or on idle

## 5) Offline Caching and Sync
- IndexedDB setup in `client/src/offline/indexedDb.ts`:
  - `documents` store for metadata/content
  - `operations` store for unsent CRDT updates
  - optional `presence` or `meta` store
- Offline queue in `client/src/offline/offlineQueue.ts`:
  - enqueue CRDT updates while offline
  - persist queue to IndexedDB
- Reconnect handling in `client/src/offline/syncOnReconnect.ts`:
  - flush offline queue
  - resync doc state from server
- Service worker in `client/src/workers/serviceWorker.ts`:
  - cache shell + editor assets
  - offline fallback for documents API

## 6) Offline Indexing and Search
- Implement a local search index (MiniSearch or Lunr):
  - index doc title + content
  - store index in IndexedDB
  - update index on every save or Yjs update
- Wire sidebar search input to local index first, remote fallback second.

## 7) UI Wiring + State Management
- Introduce global state for active doc + connection status (`client/src/app/store.ts` or a state library).
- Wire:
  - sidebar recent docs -> documents API + local cache
  - header doc title -> active doc
  - footer status -> online/offline, save status, conflict status
- Integrate `client/src/hooks/usePresence.ts` for live collaborator counts and cursor indicators.

## 8) Testing and Validation
- Manual test matrix:
  - two clients editing same doc (merge correctness)
  - offline edit -> reconnect -> conflict-free merge
  - indexed search returning cached docs when offline
  - service worker offline shell load
- Add lightweight automated tests:
  - document service + mapping
  - offline queue + IndexedDB roundtrip
  - WebSocket event parsing

## Open Decisions
- Pick editor engine and content format (JSON/HTML/Markdown).
- Decide deep-linking route (`/editor/:id`) vs single editor route.
- Define auth strategy for WebSocket handshake (cookie vs token).
