# Server + Auth Implementation Plan (MVP)

This plan covers how to implement the API routes, WebSockets, and authentication (using Better Auth for credentials and Google OAuth). It is scoped to an MVP and assumes a Unix-based environment.

## Goals (MVP)
- Users can sign up and sign in (email/password + Google OAuth).
- Authenticated users can create, list, and open documents.
- Real-time collaboration over WebSockets with Yjs sync stubs.
- Basic presence (who is online in a doc) over WebSockets.
- Offline-ready client scaffolding remains intact.

## Implementation Order
1. Database setup (Postgres schema + migrations).
2. Auth foundation (Better Auth + Google OAuth).
3. Core API routes (documents + users).
4. WebSocket layer (auth handshake + rooms + broadcasts).
5. Client auth pages (sign-in, sign-up, Google button).
6. MVP hardening (validation, basic tests, logging).

## Data Model (MVP)
Recommended tables (Postgres):
- `users` (id, email, display_name, created_at)
- `accounts` (id, user_id, provider, provider_id, created_at)
- `sessions` (id, user_id, token, expires_at)
- `documents` (id, owner_id, title, content, updated_at)
- `document_members` (document_id, user_id, role)
- `document_updates` (document_id, yjs_update, created_at) [optional MVP]

Note: Better Auth will require specific tables based on the adapter you choose. Use its migration templates and align table names to its expectations.

## API Route Plan (MVP)
All responses should be JSON and use a consistent envelope:
`{ data, message }`.

### Auth Routes
- `POST /api/auth/signup`
  - Body: `{ email, password, displayName }`
  - Returns: `{ data: { user, session }, message }`
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Returns: `{ data: { user, session }, message }`
- `POST /api/auth/logout`
  - Clears session cookie or invalidates token
- `GET /api/auth/me`
  - Returns current user if authenticated
- `POST /api/auth/sign-in/social`
  - Body: `{ provider: "google", callbackURL }`
  - Starts Google OAuth and redirects the user
- `GET /api/auth/callback/google`
  - Handles OAuth callback and creates a session

### User Routes
- `GET /api/users/me`
  - Returns current user profile
- `GET /api/users/:id`
  - Returns public profile

### Document Routes
- `GET /api/documents`
  - List documents for current user
- `POST /api/documents`
  - Create new document
- `GET /api/documents/:id`
  - Load a document
- `PATCH /api/documents/:id`
  - Update title/metadata
- `DELETE /api/documents/:id`
  - Delete document

## WebSocket Plan (MVP)
Use `ws` and keep one WS server at `/ws`.

### Connection Flow
1. Client connects to `/ws`.
2. Server validates auth (cookie or token).
3. Client sends `join_document` with documentId.
4. Server places socket in a room (documentId).
5. Server begins presence + Yjs update sync.

### Event Types (MVP)
- `auth` (client -> server): `{ token }`
- `join_document` (client -> server): `{ documentId }`
- `leave_document` (client -> server)
- `yjs_update` (bidirectional): `{ documentId, update }`
- `presence_update` (bidirectional): `{ documentId, presence }`
- `error` (server -> client): `{ message }`

### Server Responsibilities
- Validate auth once, store `socket.user`.
- Join/leave rooms using in-memory maps.
- Broadcast updates to all sockets in the same room.
- Add heartbeat/ping to keep connections alive.

## Auth Plan (Better Auth + Google OAuth)
Use Better Auth for credential auth and Google OAuth.

### 1) Install dependencies
Add to server workspace:
- `better-auth`
- A database adapter supported by Better Auth (ex: Prisma or Drizzle)

### 2) Choose session strategy
Recommended for SPA:
- HttpOnly cookie sessions (secure, less token handling in client).
Alternative:
- JWTs in `Authorization` header.

### 3) Configure Better Auth
Create a server auth module that:
- Configures Better Auth with database adapter.
- Adds providers: `credentials`.
- Exposes handlers for login/signup/logout/me.

### 4) Enable Google OAuth
Configure Better Auth `socialProviders.google` with a Google OAuth client ID/secret.

### 5) Wire Express routes
Routes in `server/src/api/auth.routes.ts` should call Better Auth handlers and return JSON responses.

### 6) Protect routes
Use middleware to read session/cookie or JWT and populate `req.user`.

## Client Auth UI Plan (MVP)
Implement two routes and a shared auth layout.

### Pages
- `client/src/app/routes.tsx`
  - Add:
    - `/auth/sign-in`
    - `/auth/sign-up`

### Sign-in Page
- Email + password form.
- Submit to `POST /api/auth/login`.
- On success, redirect to `/`.
- Add a "Sign in with Google" button that calls `POST /api/auth/sign-in/social`.
- Redirect the browser to the returned OAuth URL.

### Sign-up Page
- Email + password + display name form.
- Submit to `POST /api/auth/signup`.
- On success, redirect to `/`.
- Add a "Sign in with Google" button (same as above).

### UX Notes (MVP)
- Show loading state and error messages.
- Keep form validation minimal (required fields).

## Environment Keys (MVP)
Recommended environment variables (server):
- `NODE_ENV=development`
- `PORT=4000`
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/collab`
- `REDIS_URL=redis://localhost:6379`
- `AUTH_SECRET=change-me` (Better Auth secret)
- `AUTH_BASE_URL=http://localhost:4000`
- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`

If Better Auth requires different variable names, align your config with its docs.

### Where to get keys (Google OAuth)
- Google Cloud Console:
  1. APIs & Services -> Credentials -> Create OAuth client ID (Web).
  2. Add authorized origins:
     - `http://localhost:5173`
  3. Add redirect URI:
     - `http://localhost:4000/api/auth/callback/google`
  4. Copy Client ID/Secret into:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
- Auth secret:
  - Generate with:
    - `openssl rand -base64 32`
- Postgres:
  - Use Docker Compose or a local Postgres install.

## Postgres Quick Start (Beginner Friendly)
1. Start Postgres locally with Docker:
   - `docker compose up -d postgres`
2. Use this connection string:
   - `postgresql://postgres:postgres@localhost:5432/collab`
3. Basic `psql` connect:
   - `psql postgresql://postgres:postgres@localhost:5432/collab`
4. (Optional) Use a GUI client:
   - DBeaver or pgAdmin

## MVP Checklist
- Auth routes returning valid JSON.
- Protected document routes.
- Google OAuth sign-in works locally.
- Server creates a Better Auth session after the callback.
- WebSocket handshake authenticates and joins rooms.
- Yjs updates broadcast between clients.
- Client sign-in/up pages submit to API and redirect.
- Basic logs for auth, sockets, and API errors.

## References
- Better Auth docs: https://better-auth.com/docs
- Google OAuth setup: https://console.cloud.google.com/apis/credentials
- Postgres docs: https://www.postgresql.org/docs/
