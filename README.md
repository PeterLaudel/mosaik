# Mosaik

Practice management for psychotherapists: patients, sessions, treatment plans, homework and invoices. This repository is the API (NestJS + oRPC); the Next.js UI lives in [mosaik-ui](https://github.com/PeterLaudel/mosaik-ui) and talks to it through the oRPC contract, published as `@peterlaudel/mosaik-contract`.

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
npm run api   # API on :4000, rebuilt on change
```

All routes live under `/api`. For the UI, start [mosaik-ui](https://github.com/PeterLaudel/mosaik-ui) next to it.

The database dialect is chosen with `DATABASE_DIALECT` (`sqlite` or `postgres`), see `.env.development`.

### Contract

Each feature defines its oRPC contract in `src/features/<feature>/contract.ts`; `src/contract.ts` combines them and is what `packages/contract` publishes to GitHub Packages. To release a change, bump the version in `packages/contract/package.json` in the PR that changes a contract: the `Publish contract` workflow publishes every version that isn't on the registry yet once it lands on `main`.

### Auth

The API owns sign-in through [better-auth](https://www.better-auth.com), mounted at `/api/auth/*`: Google sign-in (`POST /api/auth/sign-in/social`, or `signIn.social` from the better-auth client), the OAuth callback, sign-out and `get-session`. Sessions live in the database (`auth_*` tables, migration 0020) and are revocable; Google tokens are stored encrypted. `GET /me` in the oRPC contract returns the signed-in user.

Auth is enforced in production only (override with `AUTH_REQUIRED=true|false`). Sending an invoice by mail always needs a signed-in account, because it goes out through that account's Gmail.

| Variable | Purpose | Default |
| --- | --- | --- |
| `AUTH_SECRET` | Signs session cookies and encrypts stored OAuth tokens | required |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth client | — |
| `API_PUBLIC_URL` | Origin the browser reaches the API on. The UI forwards `/api/*` to the API, so that is the UI's public origin. Register `<API_PUBLIC_URL>/api/auth/callback/google` as a redirect URI in the Google Cloud console | `http://localhost:4000` |
| `UI_URL` | Trusted origin the browser may be sent back to after sign-in | `http://localhost:3000` |
| `MAIL_TRANSPORT` | `json` builds mails without sending them (e.g. locally without Gmail) | Gmail |

See [docs/guidelines.md](docs/guidelines.md) for coding conventions and the checks to run before committing.
