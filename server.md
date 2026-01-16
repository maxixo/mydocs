# Server + Auth Implementation Plan (MVP)

This plan covers how to implement the API routes, WebSockets, and authentication (using Better Auth for credentials plus Firebase Google Sign-In on the client). It is scoped to an MVP and assumes a Unix-based environment.

## Goals (MVP)
- Users can sign up and sign in (email/password + Google Sign-In via Firebase client).
- Authenticated users can create, list, and open documents.
- Real-time collaboration over WebSockets with Yjs sync stubs.
- Basic presence (who is online in a doc) over WebSockets.
- Offline-ready client scaffolding remains intact.

## Implementation Order
1. Database setup (Postgres schema + migrations).
2. Auth foundation (Better Auth + Firebase Google Sign-In).
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
- `POST /api/auth/firebase`
  - Body: `{ idToken }`
  - Verifies Firebase ID token and creates a server session

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

## Auth Plan (Better Auth + Firebase Google Sign-In)
Use Better Auth for credential auth, and Firebase Auth for Google Sign-In on the client.

### 1) Install dependencies
Add to server workspace:
- `better-auth`
- A database adapter supported by Better Auth (ex: Prisma or Drizzle)
- `firebase-admin` (to verify Firebase ID tokens)

Add to client workspace:
- `firebase` (Firebase JS SDK)

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

### 4) Add Firebase token exchange
Create a new route `POST /api/auth/firebase` that:
- Verifies `idToken` with Firebase Admin.
- Upserts the user record by Firebase UID/email.
- Issues a Better Auth session or your own session cookie.

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
- Add a "Sign in with Google" button using Firebase Auth popup/redirect.
- After Firebase sign-in, send `idToken` to `POST /api/auth/firebase`.

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
- `FIREBASE_PROJECT_ID=...`
- `FIREBASE_CLIENT_EMAIL=...`
- `FIREBASE_PRIVATE_KEY=...`

Recommended environment variables (client):
- `VITE_FIREBASE_API_KEY=...`
- `VITE_FIREBASE_AUTH_DOMAIN=...`
- `VITE_FIREBASE_PROJECT_ID=...`
- `VITE_FIREBASE_APP_ID=...`
- `VITE_FIREBASE_MESSAGING_SENDER_ID=...`
- `VITE_FIREBASE_STORAGE_BUCKET=...`

If Better Auth requires different variable names, align your config with its docs.

### Where to get keys (Firebase)
- Firebase Console:
  1. Create a Firebase project.
  2. Authentication -> Sign-in method -> Enable Google provider.
  3. Project settings -> General -> Add Web App.
  4. Copy the Firebase config values into `VITE_FIREBASE_*`.
  5. Project settings -> Service accounts -> Generate new private key.
  6. Use the service account JSON to set:
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_CLIENT_EMAIL`
     - `FIREBASE_PRIVATE_KEY`
  7. Note: if you store `FIREBASE_PRIVATE_KEY` in `.env`, replace newlines with `\n`.
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
- Firebase Google sign-in works locally.
- Server exchanges Firebase ID token for an app session.
- WebSocket handshake authenticates and joins rooms.
- Yjs updates broadcast between clients.
- Client sign-in/up pages submit to API and redirect.
- Basic logs for auth, sockets, and API errors.

## References
- Better Auth docs: https://better-auth.com/docs
- Firebase Auth (Web): https://firebase.google.com/docs/auth/web/start
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
- Postgres docs: https://www.postgresql.org/docs/
