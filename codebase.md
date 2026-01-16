# Codebase Guide: Live Team Collaborative Text Editor

This document explains the repository layout, the purpose of each module, and the steps to run the project locally. The project is scaffold-only: it compiles and runs, but business logic is intentionally left as TODOs.

## Overview
The repository is a monorepo with three TypeScript workspaces:
- `client/` for the React UI (Vite)
- `server/` for the Express API + WebSocket gateway
- `shared/` for types and event contracts used in both

It also includes Docker assets, scripts, and documentation to support an offline-first, real-time collaborative editor built on Yjs + WebSockets with PostgreSQL + Redis.

## Repository Structure
Root:
- `client/` React + TypeScript (Vite) frontend
- `server/` Express + TypeScript backend
- `shared/` Shared types and event enums
- `docker/` Dockerfiles and Nginx config
- `docs/` Architecture notes and placeholders
- `scripts/` Dev scripts and placeholders
- `.env.example` Environment template
- `docker-compose.yml` Local infra (Postgres + Redis + services)
- `package.json` Workspace scripts and tooling
- `README.md` Quick overview and minimal setup

### Client (`client/`)
Purpose: UI shell and offline-first scaffolding.

Key areas:
- `client/src/app/`
  - `App.tsx` top-level layout
  - `routes.tsx` route definitions
  - `store.ts` placeholder for state management
- `client/src/editor/`
  - Editor UI shells and placeholders for collaboration actions
- `client/src/collaboration/`
  - `yjsProvider.ts` stub for Yjs connection
  - `awareness.ts` stub for presence state
  - `syncManager.ts` stub for coordinating Yjs + WS + offline
- `client/src/offline/`
  - `indexedDb.ts` stub for local persistence
  - `offlineQueue.ts` stub for queued operations
  - `syncOnReconnect.ts` placeholder for reconnect behavior
- `client/src/websocket/`
  - WebSocket wrapper and event names
- `client/src/services/`
  - API service placeholders (auth and documents)
- `client/src/workers/`
  - Service worker registration stub
- `client/src/hooks/`
  - React hooks for presence, online status, and document state
- `client/src/utils/`
  - Utility helpers (debounce, etc.)
- `client/src/types/`
  - Client-only types
- `client/public/index.html`
  - Vite HTML entry

### Server (`server/`)
Purpose: API + WebSocket gateway and collaboration orchestration.

Key areas:
- `server/src/app.ts`
  - Express app configuration and routes
- `server/src/server.ts`
  - HTTP server and WebSocket bootstrap
- `server/src/config/`
  - `env.ts` env loader
  - `db.ts` PostgreSQL connection stub
  - `redis.ts` Redis client stub
- `server/src/api/`
  - Route handlers returning placeholder JSON
- `server/src/websocket/`
  - WebSocket server init and socket handlers
- `server/src/collaboration/`
  - Yjs server, awareness, persistence placeholders
- `server/src/services/`
  - Business services (auth, documents, permissions) stubs
- `server/src/models/`
  - Model mapping stubs
- `server/src/middlewares/`
  - Auth and error middleware placeholders
- `server/src/utils/`
  - Logger helper
- `server/src/types/`
  - Server-only types
- `server/migrations/` and `server/tests/`
  - Readme placeholders for future workflows

### Shared (`shared/`)
Purpose: cross-cutting contracts shared by client and server.

Files:
- `shared/events.ts` event enums
- `shared/permissions.ts` permission enums
- `shared/types.ts` shared interfaces

## Expected Data Flow (Planned)
1. Client initializes Yjs document and connects to WebSocket.
2. WebSocket server authenticates and binds collaboration handlers.
3. Awareness updates and document changes are broadcasted.
4. Offline queue persists changes to IndexedDB.
5. On reconnect, queued changes are synced and reconciled.

All of the above steps are placeholders with TODOs for future implementation.

## How to Run Locally (Step-by-Step)
### 1) Prerequisites
- Node.js LTS (v20+)
- Docker (optional but recommended for Postgres/Redis)

### 2) Configure environment
1. Copy the example env file:
   - `cp .env.example .env`
2. Set values in `.env`:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `JWT_SECRET`

### 3) Install dependencies
From the repo root:
- `npm install`

### 4) Start infrastructure (Postgres + Redis)
Option A: Docker Compose
- `docker compose up -d postgres redis`

Option B: Local instances
- Ensure Postgres and Redis are running
- Update `.env` with your connection URLs

### 5) Run client + server together
From the repo root:
- `npm run dev`

URLs:
- Client: `http://localhost:5173/public/index.html`
- Server: `http://localhost:4000`

### 6) Run client and server separately (optional)
Client:
- `cd client`
- `npm run dev`

Server:
- `cd server`
- `npm run dev`

### 7) Build for production (optional)
From the repo root:
- `npm run build`

## Docker Usage (Optional)
To run everything via Docker:
- `docker compose up --build`

The client will be served by Nginx on:
- `http://localhost:8080`

## Troubleshooting
- If `npm install` fails, clear cache and retry:
  - `npm cache clean --force`
- If ports are in use, change them in:
  - `client/vite.config.ts` (client port)
  - `server/src/config/env.ts` or `PORT` env var (server port)

## Notes
- All TypeScript files compile and export valid symbols.
- Business logic is intentionally not implemented; look for `TODO` markers.
- This is scaffold-only and intended to be extended with real logic.
