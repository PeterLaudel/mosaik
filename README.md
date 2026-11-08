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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). In development the auth middleware is disabled.

The database dialect is chosen with `DATABASE_DIALECT` (`sqlite` or `postgres`), see `.env.development`.

### API

`npm run api` builds and runs the NestJS + oRPC API on [http://localhost:4000](http://localhost:4000), rebuilding on change.

The API owns sign-in: `GET /auth/google` starts Google OAuth, `/auth/google/callback` sets an encrypted `mosaik_session` cookie, `POST /auth/logout` clears it, and `GET /auth/me` returns the signed-in user. Auth is enforced in production only (override with `AUTH_REQUIRED=true|false`); sending an invoice by mail always needs a signed-in account, because it goes out through that account's Gmail.

| Variable | Purpose | Default |
| --- | --- | --- |
| `SESSION_SECRET` | Encrypts the session cookie | required |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth client | — |
| `API_PUBLIC_URL` | Public origin of the API; the OAuth callback is `<API_PUBLIC_URL>/auth/google/callback`, which must be registered in the Google Cloud console | `http://localhost:4000` |
| `UI_URL` | Where the browser lands after sign-in | `http://localhost:3000` |

See [docs/guidelines.md](docs/guidelines.md) for coding conventions and the checks to run before committing.

## Desktop app

`npx tauri build` runs `build.sh`, which bundles the Next.js server with `pkg` as a Tauri sidecar. The installed app keeps its database and `.env` in `~/Library/Application Support/psychotherapie-seliger`. That folder name predates the rename and is kept so existing installations keep their data.
