# Mosaik

Practice management for psychotherapists: patients, sessions, treatment plans, homework and invoices. Built with a NestJS + oRPC API and a Next.js UI, shipped as a macOS desktop app with Tauri.

The public practice homepage used to live in this repository. It now lives in [psychotherapie-seliger](https://github.com/PeterLaudel/psychotherapie-seliger).

## Features

- Patient records with encrypted personal data and diagnoses
- Sessions with clinical notes, homework assignment and review
- Treatment plans
- Services (GOP positions) and therapist profiles
- Invoices as PDF with SEPA QR code and embedded ZUGFeRD/Factur-X XML, optionally en## Development

```sh
npm install
npm run db:create
npm run db:migrate
npm run db:seed
npm run dev        # contract watcher + API on :3001 + web on :3000
```

Open [http://localhost:3000](http://localhost:3000). In development sign-in is not enforced.

The repository is a monorepo: `apps/api` (NestJS + oRPC), `apps/web` (Next.js) and `packages/contract`
(shared oRPC contract and models). See [docs/architecture.md](docs/architecture.md) for how they fit
together and how to move a domain behind the API.

Configuration lives in `apps/api/.env.<NODE_ENV>` (and `.local` overrides). The database dialect is chosen
with `DATABASE_DIALECT` (`sqlite` or `postgres`). E2e tests start both servers; set `E2E_WEB_PORT` /
`E2E_API_PORT` (and build web with a matching `API_URL`) to run them next to a dev server.

See [docs/guidelines.md](docs/guidelines.md) for coding conventions and the checks to run before committing.

o run before committing.

## Desktop app

`npx tauri build` runs `build.sh`, which bundles the Next.js server with `pkg` as a Tauri sidecar. The installed app keeps its database and `.env` in `~/Library/Application Support/psychotherapie-seliger`. That folder name predates the rename and is kept so existing installations keep their data.
