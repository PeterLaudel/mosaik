# Architecture

Mosaik is an npm workspaces monorepo:

| Package | What it is | Port |
| --- | --- | --- |
| `apps/api` (`@mosaik/api`) | NestJS + [oRPC](https://orpc.dev/docs/openapi/integrations/implement-contract-in-nest). Owns the database, migrations, seeds, repositories, outbox worker, PDF/ZUGFeRD generation, sign-in and mail. | 3001 |
| `apps/web` (`@mosaik/web`) | Next.js UI. No business logic, talks to the API through oRPC. | 3000 |
| `packages/contract` (`@mosaik/contract`) | The oRPC contract, zod schemas and domain models. The single source of truth for request/response types. | – |

```
browser ──/api/*──▶ Next.js (rewrite, same origin) ──▶ NestJS /api/*
Next server components ── serverApiClient (forwards cookies) ──▶ NestJS /api/*
```

The browser only ever talks to the web origin; `next.config.ts` proxies `/api/*` to the API with a
`fallback` rewrite, so the session cookie is first-party and no CORS is needed. The rewrite target
(`API_URL`, default `http://localhost:3001`) is baked into the web build.

## Contract-first oRPC

1. Define procedures in `packages/contract/src/procedures/<domain>.ts` with `oc.route({ method, path })`,
   `.input(zodSchema)` and `.output(zodSchema)`, and add them to `contract` in `src/index.ts`.
   Paths are relative to the API's `/api` prefix. Path and query params arrive as strings, so use
   `z.coerce.number()` for numeric ones.
2. Implement them in a Nest controller with `@Implement(contract.<domain>)` + `implement(...).handler(...)`.
   The controller must use `@Controller()` **without** a prefix, because contract paths are already absolute.
   Repositories are injected as Nest providers; convert kysely's `NoResultError` with `orNotFound`.
3. Consume them in the web app:
   - client components: `useQuery(orpc.<domain>.<proc>.queryOptions({ input }))`, mutations via `apiClient`
     (`src/lib/orpc.ts`), then `queryClient.invalidateQueries({ queryKey: orpc.<domain>.key() })`.
   - server components: `serverApiClient` (`src/lib/orpc.server.ts`), prefetch with the same query key.
4. Test the controller with `call(controller.router().<proc>, input, { context })` (see
   `apps/api/src/patients/patients.controller.test.ts`) and keep the e2e specs green.

## Auth

The API owns Google sign-in (`/api/auth/signin`, `/api/auth/callback/google`, `/api/auth/signout`).
The callback path is the one next-auth used, so the Google console's redirect URI is unchanged.
The session is an encrypted JWT (JWE, key derived from `AUTH_SECRET`) in the `mosaik.session` cookie; it
carries the Gmail refresh token used for sending invoices. A global `AuthGuard` attaches it to the request
(`context.request.session` in oRPC handlers) and enforces it in production; `@Public()` opts out.
The web proxy asks `GET /api/auth/me` before rendering `/administration/*` in production.

`AUTH_SECRET`/`APP_URL` replace `NEXTAUTH_SECRET`/`NEXTAUTH_URL`; the old names still work as fallbacks.

## Migration status

| Domain | Served by |
| --- | --- |
| Patients | API ✅ |
| Auth, invoice mailing | API ✅ |
| Invoices (list, create, PDF, status), services, sessions, treatment plans, therapists, reports | web (legacy) |

Legacy domains still run inside Next (server actions, `app/api/*` route handlers) and reach the
repositories through the **transitional `@api/*` alias** (`apps/web/tsconfig.json` → `apps/api/*`).
`next.config.ts` sets `MOSAIK_ENV_DIR` so that code reads `apps/api/.env.*` and the same database file.
To migrate a domain: add its contract, implement a controller/module in the API, switch the pages to
the oRPC clients, delete its server actions and `app/api/*` routes, and drop its `@api/src/...` imports.
When nothing imports `@api/src` any more, remove the alias, `MOSAIK_ENV_DIR`, `serverExternalPackages`
and the `apps/api/src` copy in the Dockerfile.
