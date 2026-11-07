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

See [docs/guidelines.md](docs/guidelines.md) for coding conventions and the checks to run before committing.

## Desktop app

`npx tauri build` runs `build.sh`, which bundles the Next.js server with `pkg` as a Tauri sidecar. The installed app keeps its database and `.env` in `~/Library/Application Support/psychotherapie-seliger`. That folder name predates the rename and is kept so existing installations keep their data.
