# Development guidelines

Guidelines for the API. The UI's live in [mosaik-ui](https://github.com/PeterLaudel/mosaik-ui/blob/main/docs/guidelines.md).

## Deviating from these guidelines

When a guideline cannot be followed, add an inline comment at the deviation explaining why. The comment should state the constraint that forced the exception, not just that an exception exists.

```ts
// MUI Slider has no native input, so Controller is required here instead of register
// patientId is intentionally excluded — the association is managed by the parent form
```

This keeps the codebase searchable for exceptions and prevents future readers from copying the pattern without understanding the reason.

## Before committing: typecheck, lint, test

Always run all three checks before pushing. A passing build requires all of them to be clean.

```sh
npm run typecheck   # tsc — no incremental cache
npm run lint        # eslint --max-warnings=0 (warnings fail the build)
npm run test        # jest unit/integration tests
```

`npm run ci` runs typecheck, lint, and unit tests in one command.

## Factories are table-wise: one factory per table

Each table has exactly one factory in `factories/`, in a file named after the table (`factories/patients.ts`, `factories/serviceAmounts.ts`, `factories/treatmentGoals.ts`). A factory builds and inserts one row of its table and returns that row:

- Build type: `Omit<Insertable<Database["<table>"]>, "id" | <generated columns>>`
- Created type: `Selectable<Database["<table>"]>`

Factories never use feature models (`Patient`, `Service`, ...), never assemble nested shapes (no `address` / `billingInfo` sub-factories), and never insert into a second table. A test that needs a service with prices creates the `services` row and its `serviceAmounts` rows explicitly. JSON columns are passed as strings, matching what the DB actually stores.

```ts
const service = await serviceFactory.create({ short: "Super short" });
await serviceAmountFactory.create({ serviceId: service.id, factor: "2.3", price: 23 });
```

Tests that check how a repository maps rows into a model build the expected model from the row explicitly, instead of comparing against a factory result that already has the model's shape.

## Factories must respect overridden foreign keys

When `onCreate` needs a parent row (a patient before a session), it creates one only if the caller did not pass the foreign key. If `onCreate` always creates and overwrites, passing `patientId` in overrides has no effect:

```ts
// this silently creates a second, unrelated patient and uses that id instead
await sessionFactory.create({ patientId: existingPatient.id });
```

Make the foreign key optional in the build type and reuse it when present:

```ts
.onCreate(async (attrs) => {
  let { patientId } = attrs;
  if (patientId === undefined) {
    const patient = await patientFactory.create();
    patientId = patient.id;
  }
  const db = getDb();
  return db.insertInto("sessions").values({ ...attrs, patientId }).returningAll().executeTakeFirstOrThrow();
})
```

Never default a foreign key to `sequence` or another made-up id: it points at a row that may not exist. This lets tests share associations across factory calls without unnecessary DB inserts.

## Code is organized by feature

Everything a feature needs on the server lives in its own folder under `src/features/`:

```
src/features/invoices/
  model.ts          types this feature owns (Invoice, InvoicePatient, ...)
  repository.ts     reads/writes, incl. this feature's selectors
  service.ts        business logic used by server actions and routes
  queries.ts        client-side fetch helpers for this feature's API routes
  index.ts          get*Service() (server only); repositories stay internal
  *.test.ts         tests next to the code they cover
src/shared/         infrastructure used by several features (outbox, ollama)
src/app/            routes, pages, server actions and UI components
```

`src/app` is where features are composed: a page may read from several features, but always through their services. Repositories are internal to their feature (not exported from `index.ts`, and `src/app` may not import `@/features/*/repository`), so reads go through the service as well as writes. `index.ts` pulls in the database, so client components import only `model.ts` or `queries.ts`, never the feature's `index.ts`.

## Features share data, not code

A feature never imports another feature (enforced by `no-restricted-imports` in `eslint.config.js`), and `src/shared` never imports a feature. When a feature needs data that another feature manages, it defines its own type with just the fields it reads and its repository reads them straight from the shared tables:

```ts
// src/features/invoices/model.ts
export interface InvoicePatient {
  id: number;
  name: string;
  surname: string;
  birthdate: string;
  diagnosis: string | null;
  billingInfo: InvoiceBillingInfo;
  invoicePassword: string | null;
}

export interface Invoice {
  patient: InvoicePatient; // not the patients feature's Patient
  // ...
}
```

The repository still does the join, so a model embeds its parent instead of a bare foreign key. But the embedded object is the feature's own projection (`InvoicePatient`, `SessionPatient`, `TreatmentPlanPatient`), not another feature's model. Lookups a feature needs for its own UI (e.g. the patients and services an invoice can be written for) are methods on that feature's repository (`InvoicesRepository.findPatients()`), not calls into the other feature. Duplicating a few columns in a selector is the intended cost of keeping features independent.

## One-to-many child collections are saved atomically with their parent

When a model owns a list of children (e.g. `TreatmentPlan.goals`, `Invoice.positions`), the repository must save the children as part of the parent `create()` / `update()` call using a transaction — delete all existing children for that parent, then reinsert from the array in the payload.

Do not expose individual `saveChild` / `deleteChild` methods on the repository for children that are always managed through their parent.

```ts
private async replaceGoals(planId: number, goals: TreatmentGoal[], trx: Database) {
  await trx.deleteFrom("treatment_goals").where("treatmentPlanId", "=", planId).execute();
  if (goals.length === 0) return;
  await trx.insertInto("treatment_goals").values(
    goals.map((g) => ({ ...g, treatmentPlanId: planId }))
  ).execute();
}
```

The child model type contains only data fields — no `id`, no parent FK, no `createdAt`. These are DB implementation details managed by the repository.

## Repository writes are split into `create` and `update`

Each repository exposes a separate `create` and `update` method. Never write a combined `save`/`upsert` that branches on whether an `id` is present: inserting and updating are different responsibilities (an update may need the previous state, for example to detect a status transition), and a combined method hides which one a caller actually performs.

Each repository exports an `XCreate` payload type next to the class: the model without `id` (and without other DB-managed columns such as `createdAt`). `update` takes the model itself. Only when the model carries DB-managed columns that callers must not send (e.g. `createdAt` on `Session` and `TreatmentPlan`) does the repository also export `XUpdate = XCreate & { id: number }`; don't add an `XUpdate` alias that is structurally identical to the model.

```ts
async create(plan: TreatmentPlanCreate): Promise<TreatmentPlan> {
  const { id } = await trx.insertInto("treatment_plans").values(this.toRow(plan))...
  return this.find(id);
}

async update(plan: TreatmentPlanUpdate): Promise<TreatmentPlan> {
  await trx.updateTable("treatment_plans").set(this.toRow(plan)).where("id", "=", plan.id)...
  return this.find(plan.id);
}
```

Shared column mapping lives in a private `toRow` helper, and child collections in a private `replaceX` helper, so `create` and `update` do not duplicate it. Services and server actions follow the same split. Forms shared by a create and an edit page do not carry an `id`: the edit page binds it into the update action (`updatePatient.bind(null, patient.id)`), so the form only ever submits an `XCreate` payload.

## Repository methods take models, not raw IDs

Methods that act on a specific entity receive the model (or a `Pick<Model, "id">`), never a bare integer. This makes call sites self-documenting and prevents accidental ID mix-ups between entity types.

```ts
// correct
async updateStatus(homework: Pick<Homework, "id">, status: HomeworkStatus): Promise<void>
async softDelete(session: Pick<Session, "id">): Promise<void>

// wrong
async updateStatus(id: number, status: HomeworkStatus): Promise<void>
async softDelete(id: number): Promise<void>
```

Query methods that take filter parameters (e.g. `patientId` as a search criterion) are not entity references and may use scalar types.

## New migration files must be registered in `migrationProvider.ts`

Adding a file to `migrations/` is not enough on its own. `src/database/migrationProvider.ts` explicitly imports every migration into a `Record<string, Migration>` — this is what the app runtime, unit/integration tests, and e2e setup actually use via `Migrator`. The `kysely migrate:latest` CLI (`npm run db:migrate`) discovers files from the folder directly and will run a new migration fine, which can mask a missing registration until tests or a fresh e2e/CI database fail.

When adding a migration, always update both files:

```ts
// src/database/migrationProvider.ts
import * as m0018 from "../../migrations/0018_alter_sessions_add_pseudonymization";

const migrations: Record<string, Migration> = {
  // ...
  "0018_alter_sessions_add_pseudonymization": m0018,
};
```
## Floating promises must be marked with `void`

The `@typescript-eslint/no-floating-promises` rule is enabled with `--max-warnings=0`, so any unawaited promise fails the build. When you intentionally fire-and-forget a promise (e.g. inside an event handler), prefix it with `void`.

```ts
void createSession(patientId).then((s) => setSession(s));
```

## Keep calls flat

Avoid nesting calls inside calls (`f(g(h(x)))`, `new A(new B(getDb()))`). Give each intermediate result a named variable, one step per line, so the reader follows the data top to bottom.

```ts
// correct
const database = getDb();
const invoicesRepository = new InvoicesRepository(database);
const service = new InvoicesService(invoicesRepository);
return Promise.resolve(service);

// wrong
return Promise.resolve(new InvoicesService(new InvoicesRepository(getDb())));
```

Fluent query-builder chains (`db.selectFrom(...).where(...).execute()`) are fine; this is about calls passed as arguments to other calls.
