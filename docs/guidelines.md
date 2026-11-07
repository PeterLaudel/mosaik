# Development guidelines

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
CI=true npm run e2e # playwright e2e tests (CI=true disables retries and the browser)
```

`npm run ci` runs typecheck, lint, and unit tests in one command. E2e tests require the dev server to be running and a seeded database, so they are run separately.

## E2e tests cover every UI feature with Playwright

Every user-facing feature must have Playwright e2e tests in `e2e/<feature>/`. Tests use the custom `test` fixture from `e2e/fixtures.ts`, which injects an auth cookie and clears the database after each test. Seed data goes through factories — never raw DB calls in spec files.

```ts
import { patientFactory } from "factories/patient";
import { test, expect } from "../fixtures";

test("creates a treatment plan and shows success message", async ({ page }) => {
  const patient = await patientFactory.create();
  await page.goto(`/administration/patients/${patient.id}/treatment-plan`);

  await page.getByRole("textbox", { name: "Beginn" }).fill("2024-01-15");
  await page.getByRole("button", { name: "Speichern" }).click();

  await expect(page.getByText("Behandlungsplan gespeichert")).toBeVisible();
});
```

Use `getByRole` with an accessible name as the primary locator. Interactive elements that have no visible label (icon buttons) must carry an `aria-label` so tests can target them without relying on emoji text or DOM structure.

Split tests by operation: `create.spec.ts` for creation flows, `update.spec.ts` for edit/delete flows, `show.spec.ts` for read-only display assertions.

E2e tests require a production build (`npm run build`) and run with `CI=true npm run e2e`. They are separate from the unit/integration suite (`npm run ci`) because they need the dev server and a seeded database.

## Form save button placement

Every form that persists data must use `SubmitButton` (`src/components/submitButton.tsx`) as its submit control. Place it at the bottom of the form, left-aligned:

```tsx
<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
  <Section>...</Section>
  <Section>...</Section>
  <SubmitButton submitting={isPending} className="justify-self-start">
    Speichern
  </SubmitButton>
</form>
```

Use `"Speichern"` for all save/create actions — do not use `"Anlegen"`, `"Erstellen"`, or `"Hinzufügen"`. Do not place save triggers inside section cards, in a top bar, or as floating buttons — the bottom position sets a consistent expectation for users and makes the save action easy to find after editing any field.

## Show a success snackbar after every form save

After a successful mutation, call `showSuccessMessage` from `useSnackbar` (`@/contexts/snackbarProvider`). This gives the user explicit confirmation that their change was persisted.

```tsx
const { showSuccessMessage } = useSnackbar();

const onSubmit = (values: FormValues) => {
  startTransition(async () => {
    await save(values);
    showSuccessMessage("Behandlungsplan gespeichert");
  });
};
```

Use a past-tense German phrase that names the entity: `"Patient gespeichert"`, `"Behandlungsplan gespeichert"`, `"Sitzung abgeschlossen"`. Do not show a snackbar on error — let the form handle validation feedback inline.

## Use React Hook Form for all forms

All forms must use `useForm` / `FormProvider` / `useFormContext`. Do not manage form state with `useState` or track values with refs. RHF stores field state internally via refs, which means `getValues()` always returns the current, complete form snapshot without triggering re-renders.

Use `register` for native inputs (text, number, date). Use `Controller` only when a component has no native input — MUI Slider, chip toggle groups, and custom button groups.

## Autosave: read with `getValues()`, not from the callback argument

The `watch()` callback receives a partial snapshot of whichever field just changed. If you capture that value in a debounce closure, you persist stale or incomplete data on every save. Always call `methods.getValues()` inside the debounce timeout to get the full, current form state at the moment the save fires.

```ts
const subscription = methods.watch(() => {
  clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(async () => {
    const values = methods.getValues(); // full snapshot, not the partial arg
    await save(values);
  }, 2500);
});
```

## MUI Select requires a controlled `value` when used with `register`

MUI `Select` is a controlled component. `register` only wires up the `ref`, `name`, `onChange`, and `onBlur` props — it does not set `value`. Without an explicit `value`, MUI logs an out-of-range warning and the field renders incorrectly after reset or navigation. Add the field to `watch` and pass the result as `value`.

```tsx
const [sessionType, phase] = watch(["sessionType", "phase"]);
<Select {...register("sessionType")} value={sessionType ?? ""}>
```

## Patient and entity pickers must use `Autocomplete`, not `Select`

`Select` renders a dropdown over a static list and requires a `labelId`/`id` pair to be accessible. `Autocomplete` renders with `role="combobox"` and derives its accessible name directly from the `label` on its `renderInput` `TextField`. It also supports free-text filtering, which is expected for long patient lists. Always use `Autocomplete` for entity pickers.

## Mutations belong in server actions, not API route handlers

POST and PATCH mutations should be `"use server"` functions in an `actions.ts` file colocated with the feature. This removes an HTTP round-trip, keeps the server-side logic type-safe end-to-end, and avoids exposing a public endpoint that needs its own input validation.

GET endpoints that return data (used by server components or external clients) remain as route handlers in `app/api/`.

## Server actions only hold Next.js concerns; logic lives in services

A server action is a thin adapter: it gets a service, calls one method, and does the Next.js-specific work (`revalidatePath`, `redirect`, cookies). Everything else (loading entities, defaults, status transitions, mailing, orchestration across repositories) belongs in the feature's service class (`src/features/<feature>/service.ts`).

Services receive their repositories through the constructor, the same way repositories receive `db`, and are obtained in actions through the `get*Service()` helpers exported from the feature's `index.ts` (e.g. `@/features/invoices`). Services must not import from `next/*` so they stay usable from the worker, tests and route handlers.

```ts
// src/app/administration/invoices/(index)/action.ts
export async function markInvoiceAsPaid(invoiceId: number) {
  const invoicesService = await getInvoicesService();
  await invoicesService.updateStatus(invoiceId, "paid");
  revalidatePath("/administration/invoices");
}
```

Test services directly (`src/features/<feature>/service.test.ts`) by constructing them with real repositories against the test database.

## API route PATCH handlers must use an explicit field allowlist

Never spread the raw request body into a `save` or `update` call in an API route handler. An `...body` spread lets a client overwrite any column, including `deletedAt`, `status`, or other fields not intended to be user-editable.

For each field, be explicit about nullability:

- Non-nullable fields: `data.field ?? existing.field`
- Nullable fields: `data.field !== undefined ? data.field : existing.field`

This does not apply to server actions. Because server actions are called from typed TypeScript code rather than accepting raw HTTP input, `{ ...existing, ...data }` is safe — the TypeScript signature already constrains what `data` can contain.

## Route naming: use `/create`, not `/new`

Name resource creation routes `/create` rather than `/new`. The `/new` convention originates from Rails and is not meaningful in Next.js. `/create` reads as an action and is consistent with the rest actions used elsewhere.

## Nest resources under their owner in the URL

A resource that only makes sense in the context of a parent belongs under the parent's route segment. Sessions only exist in the context of a patient, so their URL is `/patients/:patientId/sessions/:sessionId` — not a top-level `/documentation/:id`. This makes ownership explicit in the URL and keeps server components close to the data they need.

## Use route groups to scope layouts

In Next.js App Router, every `layout.tsx` wraps all pages beneath it. When only some child pages should inherit a layout (e.g. a patient header with tabs), move those pages into a route group (`(group-name)/`) with its own `layout.tsx`. Pages outside the group — like the session edit page — are not wrapped.

```
patients/[patientId]/
  (patient-view)/          ← layout with patient header + tabs
    layout.tsx
    page.tsx               ← /patients/:id
    sessions/
      page.tsx             ← /patients/:id/sessions
  sessions/
    [sessionId]/
      page.tsx             ← /patients/:id/sessions/:id (no tabs)
```

Route group directory names are stripped from the URL, so `(patient-view)` adds no segment.

## Never create records on page load

Do not create database records as a side effect of rendering a page or mounting a component. A user navigating to a page and immediately pressing back would leave an orphaned draft record with no way to clean it up.

Create records only in response to an explicit user action. For session creation, the server action is called when the user clicks the button, and the result is used to navigate to the new record's page.

## E2e tests must use factories, not direct DB access

Do not call `getDb()` or any repository method directly inside `*.spec.ts` files. Use the factory helpers in `factories/`. Factories handle associations (e.g. creating a patient before a session), apply sensible defaults, and keep tests resilient to schema changes.

```ts
// correct
const session = await sessionFactory.create({ riskLevel: "high" });

// wrong
const db = getDb();
await db.insertInto("sessions").values({ ... }).execute();
```

## Factories must respect overridden foreign keys

Factories use raw DB types (`Insertable<Table>` / `Selectable<Table>`) — that is intentional and correct. JSON columns are passed as strings, matching what the DB actually stores.

However, when `onCreate` creates a required association (e.g. a patient before a session), it must check whether the caller already supplied the foreign key before creating a new record. If `onCreate` always creates and overwrites, passing `patientId` in overrides has no effect:

```ts
// this silently creates a second, unrelated patient and uses that id instead
await sessionFactory.create({ patientId: existingPatient.id });
```

The fix is to reuse the supplied key when present:

```ts
.onCreate(async (attrs) => {
  const patientId = attrs.patientId ?? (await patientFactory.create()).id;
  return getDb().insertInto("sessions").values({ ...attrs, patientId })...
})
```

This lets tests share associations across factory calls without unnecessary DB inserts.

## Floating promises must be marked with `void`

The `@typescript-eslint/no-floating-promises` rule is enabled with `--max-warnings=0`, so any unawaited promise fails the build. When you intentionally fire-and-forget a promise (e.g. inside an event handler), prefix it with `void`.

```ts
void createSession(patientId).then((s) => setSession(s));
```

## React Compiler incompatibility with `methods.watch()`

The React Compiler eslint plugin flags `methods.watch()` inside a `useEffect` as an incompatible library call. This is a known limitation — RHF's `watch()` subscription model predates the compiler and cannot be automatically memoized. Suppress the warning with an inline comment and a brief explanation so reviewers know it is intentional.

```ts
// eslint-disable-next-line react-hooks/incompatible-library -- RHF watch() subscription; cleaned up on unmount
const subscription = methods.watch(() => { ... });
```

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
