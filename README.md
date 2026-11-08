# Mosaik

Practice management for psychotherapists: patients, sessions, treatment plans, homework and invoices. Built with Next.js and shipped as a macOS desktop app with Tauri.

The public practice homepage used to live in this repository. It now lives in [psychotherapie-seliger](https://github.com/PeterLaudel/psychotherapie-seliger).

## Features

- Patient records with encrypted personal data and diagnoses
- Sessions with clinical notes, homework assignment and review
- Treatment plans
- Services (GOP positions) and therapist profiles
- Invoices as PDF with SEPA QR code and embedded ZUGFeRD/Factur-X XML, optionally encrypted and sent by mail

## Development

```sh
npm install
npm run db:create
npm run db:migrate
npm run db:seed
npm run api   # API on :4000
npm run dev   # UI on :3000, in a second terminal
```

The repository is an npm workspace: the API lives at the root (`src/`), the Next.js UI in `ui/`, and the oRPC contract package in `packages/contract/` (the UI depends on it and builds it before `dev`, `build` and `typecheck`). `npm run lint` and `npm run typecheck` cover both. E2E tests (`e2e/`) start the API and the built UI (`npm run build` first).

Open [http://localhost:3000](http://localhost:3000). The UI is a pure API client: the browser calls `/api/*` on the UI's origin, which Next forwards to the API (`API_URL`, default `http://localhost:4000`), and server components call `API_URL` directly. In development the sign-in redirect is disabled.

The database dialect is chosen with `DATABASE_DIALECT` (`sqlite` or `postgres`), see `.env.development`.

### API

`npm run api` builds and runs the NestJS + oRPC API on [http://localhost:4000](http://localhost:4000), rebuilding on change. All its routes live under `/api`.

The API owns sign-in through [better-auth](https://www.better-auth.com), mounted at `/api/auth/*`: Google sign-in (`POST /api/auth/sign-in/social`, or `signIn.social` from the better-auth client), the OAuth callback, sign-out and `get-session`. Sessions live in the database (`auth_*` tables, migration 0020) and are revocable; Google tokens are stored encrypted. `GET /me` in the oRPC contract returns the signed-in user.

Auth is enforced in production only (override with `AUTH_REQUIRED=true|false`). Sending an invoice by mail always needs a signed-in account, because it goes out through that account's Gmail.

| Variable | Purpose | Default |
| --- | --- | --- |
| `AUTH_SECRET` | Signs session cookies and encrypts stored OAuth tokens | required |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth client | — |
| `API_PUBLIC_URL` | Origin the browser reaches the API on. Behind the UI's `/api` rewrite that is the UI's public origin. Register `<API_PUBLIC_URL>/api/auth/callback/google` as a redirect URI in the Google Cloud console | `http://localhost:4000` |
| `API_URL` (UI) | Where the Next app reaches the API, for the rewrite and server components | `http://localhost:4000` |
| `UI_URL` | Trusted origin the browser may be sent back to after sign-in | `http://localhost:3000` |
| `MAIL_TRANSPORT` | `json` keeps mails in memory instead of sending them (e2e) | Gmail |

See [docs/guidelines.md](docs/guidelines.md) for coding conventions and the checks to run before committing.
