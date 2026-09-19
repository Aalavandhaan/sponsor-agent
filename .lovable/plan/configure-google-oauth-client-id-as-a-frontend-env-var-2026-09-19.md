# Configure Google OAuth Client ID as a frontend env var

## Goal

Move the Google OAuth Client ID from the server-side secret lookup to a public frontend environment variable, `VITE_GOOGLE_CLIENT_ID`, read via `import.meta.env.VITE_GOOGLE_CLIENT_ID`.

## What changes

1. **Store the client ID as `VITE_GOOGLE_CLIENT_ID`** — set the existing `GOOGLE_OAUTH_CLIENT_ID` secret value under the new `VITE_GOOGLE_CLIENT_ID` name so Vite exposes it to browser code. (VITE_* vars are public by design; a Google OAuth **Client ID** is safe to expose — no client secret is used or requested anywhere.)
2. **`src/components/sponsor-agent/sponsor-workspace.tsx`** — in `connectGmail()`, replace the `getGoogleClientId()` server call with a direct read of `import.meta.env.VITE_GOOGLE_CLIENT_ID`, keeping a clear error message if the variable is missing.
3. **Delete `src/lib/google-config.functions.ts`** — no longer needed once the client ID comes from the frontend env var.

## What does NOT change

- No UI or visual changes of any kind.
- The Gmail OAuth flow stays exactly as-is: Google Identity Services token client, `gmail.send` scope only, access token held in memory only (never localStorage).
- The AWS `/analyze` and `/find-contact` integrations are untouched.
- No Google client secret is introduced anywhere.

## Technical details

- Files touched: `src/components/sponsor-agent/sponsor-workspace.tsx` (one import + the `connectGmail` function), removal of `src/lib/google-config.functions.ts`.
- Env var: `VITE_GOOGLE_CLIENT_ID` set with the value of the existing `GOOGLE_OAUTH_CLIENT_ID` secret.
- Verification: `bunx tsgo --noEmit`, then a Playwright run confirming the app loads, the Connect Gmail button is present and triggers the token-client flow (no "missing client ID" error), and no console errors.
