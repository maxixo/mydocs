# Google Better Auth Changes

This document lists the changes made to switch Google sign-in from Firebase client auth to Better Auth OAuth.

## Summary
- Replaced Firebase Google sign-in with Better Auth OAuth on the client.
- Added Better Auth OAuth support on the server.
- Updated environment variables and docs to match Better Auth.

## Client Changes
- Added `client/src/pages/OAuthGoogleButton.tsx` to call the backend OAuth endpoint and redirect to Google.
  - POSTs to `/api/auth/sign-in/social` with `{ provider: "google", callbackURL, disableRedirect: true }`.
  - Redirects the browser to the returned `url`.
- Removed Firebase usage in sign-in and sign-up pages.
- Cleaned up auth service usage to rely on Better Auth endpoints only.
- Updated `client/package.json` to remove `firebase` dependency.
- Updated `client/.env.example` to only include `VITE_API_BASE_URL`.

## Server Changes
- Added Better Auth config in `server/src/auth.ts`.
  - Uses PostgreSQL `Pool` adapter.
  - Enables `emailAndPassword`.
  - Adds `socialProviders.google` using `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
  - Exposes `runAuthMigrations()` for startup migrations.
- Updated `server/src/server.ts` to run Better Auth migrations before listening.
- Updated `server/src/api/auth.routes.ts` to proxy Better Auth endpoints:
  - `POST /api/auth/sign-in/social` -> `sign-in/social`
  - `GET /api/auth/callback/:provider` -> `callback/:provider`
  - Existing email/password endpoints map to Better Auth handlers.
- Updated `server/src/config/env.ts` to include:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `AUTH_SECRET`
  - `AUTH_BASE_URL`
- Updated `server/src/app.ts` to allow `credentials` and `origin: true` for cookies.

## Environment Variables
Root `.env.example` now includes:
- `GOOGLE_CLIENT_ID=`
- `GOOGLE_CLIENT_SECRET=`
- `AUTH_SECRET=`
- `AUTH_BASE_URL=http://localhost:4000`

Client `.env.example` includes:
- `VITE_API_BASE_URL=http://localhost:4000`

## Google OAuth Console Setup
- Authorized JavaScript origin:
  - `http://localhost:5173`
- Authorized redirect URI:
  - `http://localhost:4000/api/auth/callback/google`

## Related Docs Updated
- `server.md` updated to describe Better Auth Google OAuth flow.
- `betterauth.md` updated to reflect the change from Firebase Google sign-in.

