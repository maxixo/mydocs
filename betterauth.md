# Better Auth + Firebase Google Sign-In Changes

This file summarizes all code changes made to implement Better Auth (email/password + Google OAuth) on the backend and client.

## Backend Changes

### `server/src/auth.ts`
- Added Better Auth initialization using a PostgreSQL `Pool`.
- Enforces `DATABASE_URL` (throws if missing).
- Uses `AUTH_SECRET` (fallback to `JWT_SECRET`) and `AUTH_BASE_URL`.
- Enables `emailAndPassword` login.
- Configures Google OAuth provider when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.
- Disables CSRF/origin checks for the Express proxy flow.
- Added `runAuthMigrations()` to create Better Auth tables on startup.

### `server/src/config/env.ts`
- Added:
  - `authSecret`
  - `authBaseUrl`
- Added:
  - `googleClientId`
  - `googleClientSecret`
- `authSecret` falls back to `JWT_SECRET` if `AUTH_SECRET` isn’t present.
- `authBaseUrl` defaults to `http://localhost:${PORT}`.

### `server/src/api/auth.routes.ts`
- Replaced placeholders with real Better Auth proxy logic.
- Added `buildAuthRequest()` to construct a Web `Request` and forward headers.
- Added `sendAuthResponse()` to forward status/headers/body (including `set-cookie`) back to Express.
- Implemented:
  - `POST /api/auth/signup` → Better Auth `/sign-up/email`
  - `POST /api/auth/login` → Better Auth `/sign-in/email`
  - `POST /api/auth/sign-in` → Better Auth `/sign-in/email`
  - `POST /api/auth/sign-in/social` → Better Auth `/sign-in/social`
  - `POST /api/auth/logout` → Better Auth `/sign-out`
  - `GET /api/auth/me` → Better Auth `/get-session`
  - `GET /api/auth/callback/:provider` → Better Auth `/callback/:provider`

### `server/src/server.ts`
- Wrapped startup in `startServer()`.
- Runs `runAuthMigrations()` before server starts.
- Logs fatal errors and exits if migrations fail.

### `server/src/app.ts`
- Updated CORS to allow credentials:
  - `origin: true`
  - `credentials: true`

## Client Changes

### `client/src/pages/OAuthGoogleButton.tsx`
- New reusable Google sign-in button.
- Calls Better Auth social sign-in endpoint (`/api/auth/sign-in/social`) to get the OAuth URL.
- Redirects the browser to the Google OAuth URL.
- Shows loading and error state.

### `client/src/services/auth.service.ts`
- Replaced placeholders with real API calls:
  - `signInWithEmail()` → `POST /api/auth/login`
  - `signUpWithEmail()` → `POST /api/auth/signup`
  - `logout()` → `POST /api/auth/logout`
- Added typed response interfaces and error handling.
- Added `VITE_API_BASE_URL` fallback.

### `client/src/pages/SignIn.tsx`
- Calls `signInWithEmail()`, stores token, redirects to `/`.
- Uses `OAuthGoogleButton`.
- Added loading + error UI.

### `client/src/pages/SignUp.tsx`
- Calls `signUpWithEmail()`, stores token if returned, redirects to `/`.
- Uses `OAuthGoogleButton`.
- Added loading + error UI.

### `client/src/main.css`
- Added `.auth-error` style for error messages.

### `.env.example`
- Added:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

### `client/.env.example`
- Added `VITE_API_BASE_URL=http://localhost:4000`.

## Behavior Summary
- Email/password sign-up and sign-in now work via Better Auth.
- Better Auth sessions are stored via cookies (CORS allows credentials).
- Google sign-in uses Better Auth OAuth flow and redirects through `/api/auth/callback/google`.
- After successful sign-in/sign-up, user is routed to `/` (editor).

## Notes
- No Firebase SDK is used.
- `ProtectedRoute` checks the server session via `/api/auth/me`.
- Database migrations run automatically on server start.
