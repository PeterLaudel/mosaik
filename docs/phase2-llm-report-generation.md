# Phase 2 — LLM Report Generation

## Architecture Overview

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│        Next.js app          │     │         Worker process       │
│                             │     │         (src/worker.ts)      │
│  Finalize session           │     │                              │
│    → UPDATE sessions        │     │  Poll outbox every ~2s       │
│    → INSERT outbox event    │     │    → pseudonymize_session    │
│      [single transaction]   │     │      → Ollama/mistral        │
│                             │     │    → generate_report         │
│  Generate report            │     │      → Claude API            │
│    → INSERT reports         │     │                              │
│    → INSERT report_sessions │     │  Marks outbox row processed  │
│    → INSERT outbox event    │     │  Updates session/report row  │
│      [single transaction]   │     └─────────────────────────────┘
│    → returns reportId       │
│                             │
│  UI polls report status     │
└─────────────────────────────┘
```

Two processes run in Docker Compose — Next.js and the worker. The outbox table is the handoff point. Either process can restart independently without losing jobs.

---

## Step 1 — Pseudonymization: DB Migration

New fields on the existing `sessions` table:

| Field | Type | Description |
|---|---|---|
| `pseudonymized_notes` | text \| null | Pseudonymized `clinicalNotes` text |
| `pseudonymized_next_plan` | text \| null | Pseudonymized `nextSessionPlan` text |
| `pseudonymization_status` | text \| null | `"pending"` \| `"done"` \| `"failed"` |

New **`outbox`** table (shared by all event types):

| Field | Type | Description |
|---|---|---|
| `id` | integer | PK |
| `event_type` | text | e.g. `"session.finalized"`, `"report.requested"` |
| `payload` | text | JSON payload |
| `processed_at` | text \| null | null = unprocessed, set by worker on completion |
| `created_at` | text | |

Deliverables: two migration files, Kysely DB types updated.

---

## Step 2 — Pseudonymization: Service (`src/features/sessions/pseudonymization/pseudonymizer.ts`)

Runs entirely within the local cluster. Real patient data never leaves the system.

### Timing — event-based, processed by separate worker

```
Therapist clicks "Sitzung abschließen" (existing Server Action)
        ↓
BEGIN TRANSACTION
  session.status → "final"
  INSERT outbox ({ type: "session.finalized", sessionId })
COMMIT
        ↓  [returns immediately to UI]

Worker process polls outbox
        ↓
Picks up "session.finalized" event
        ↓
Ollama/mistral pseudonymizes clinicalNotes + nextSessionPlan
        ↓
pseudonymized_notes + pseudonymized_next_plan stored
pseudonymization_status → "done"
outbox row marked processed
```

When the therapist later clicks "Generate Report", the pseudonymized text is already ready — only the Claude API call (~3–5s) remains.

**Crash safety** is guaranteed by the outbox: the event is written in the same transaction as the session status update. If the worker crashes mid-job, it picks up the unprocessed outbox row on restart and retries. No manual re-enqueue logic needed.

**Failed jobs:** if `pseudonymizeSession()` throws, the worker sets `pseudonymization_status: "failed"` on the session and leaves the outbox row unprocessed (`processed_at` remains null). On the next poll cycle the worker picks it up and retries automatically.

### Worker Process (`src/worker.ts`)

A separate Node.js process that runs alongside Next.js in Docker Compose. It polls the `outbox` table and processes events:

```typescript
async function processOutbox() {
  while (true) {
    const events = await db
      .selectFrom("outbox")
      .where("processed_at", "is", null)
      .selectAll()
      .execute();

    for (const event of events) {
      await handleEvent(event);
      await db.updateTable("outbox")
        .set({ processed_at: new Date().toISOString() })
        .where("id", "=", event.id)
        .execute();
    }

    await sleep(2000);
  }
}

async function handleEvent(event: OutboxEvent) {
  const payload = JSON.parse(event.payload);
  switch (event.event_type) {
    case "session.finalized":
      return pseudonymizeSession(payload.sessionId);
    case "report.requested":
      return generateReport(payload.reportId);
  }
}
```

The worker and Next.js app share the same DB and `src/features/` code — no duplication needed. To swap to RabbitMQ or BullMQ later, only `src/worker.ts` needs to change.

### Two-Pass Approach

**Pass 1 — rule-based** (structured fields, no LLM):
- `patient.name`, `patient.surname` → `[Patient]`
- `patient.birthdate` → `[Geburtsdatum]`
- Therapist name → `[Therapeut]`
- Known locations (city, street) → `[Ort]`

**Pass 2 — LLM (Ollama/mistral)** (implicit identifiers in free text):
- Third-party persons: *"ihr Lebensgefährte Jens"* → *"ihr Lebensgefährte [Person]"*
- Implicit locations: *"Klinik in München"* → *"Klinik in [Ort]"*
- Identifying date references → `[Datum]`
- Identifying job titles → `[Beruf]`

Deliberately **not** used:
- **spaCy NER** — too many false positives on psychotherapy terminology (`Stimmungstagebuch`, `Verhaltensaktivierung` were classified as persons)
- **phi3:mini** — hallucinates text, corrupts clinical content
- **RabbitMQ** — overkill for a single-practice setup

### Placeholder Schema

| Original | Placeholder |
|---|---|
| Patient name | `[Patient]` |
| Therapist name | `[Therapeut]` |
| Referring doctor | `[Arzt]` |
| Date of birth | `[Geburtsdatum]` |
| Third-party persons | `[Person]` |
| Locations / streets | `[Ort]` |
| Identifying dates | `[Datum]` |
| Identifying job titles | `[Beruf]` |

### Prompt — Pseudonymization (`src/features/sessions/pseudonymization/pseudonymization.ts`)

System prompt and user message are separated — enables prompt caching if later switched to Claude API. Prompts remain in German as they instruct a German-language task.

**System Prompt:**
```
Du bist ein Datenschutz-Assistent für eine psychotherapeutische Praxis (DSGVO).

Du erhältst einen Text als JSON mit folgendem Feld:
- text: der zu pseudonymisierende Freitext aus einer Therapiesitzung

Deine Aufgabe: Ersetze alle personenidentifizierenden Informationen durch Platzhalter.
Bereits ersetzte Platzhalter (z.B. [Patient], [Therapeut]) bleiben unverändert.

Ersetze ALLE der folgenden Kategorien:
- Vornamen und Nachnamen von Personen → [Person]
  Dazu zählen ausdrücklich: Partner, Lebensgefährten, Ehepartner, Geschwister,
  Eltern, Kinder, Freunde, Kollegen, Vorgesetzte – auch wenn sie nur durch ihre
  Beziehung erwähnt werden (z.B. "ihr Lebensgefährte Jens" → "ihr Lebensgefährte [Person]")
- Ortsnamen, Stadtteile, Straßen und Straßennamen (mit oder ohne Hausnummer), Gebäude → [Ort]
- Datumsangaben mit Monatsname oder Tagesangabe → [Datum]
- Berufsbezeichnungen die identifizierend sein könnten → [Beruf]

Nicht anonymisieren:
- Medizinische Diagnosen, Symptombeschreibungen, Interventionen, Testergebnisse (PHQ-9 etc.)

Antworte NUR mit dem bereinigten Text, keine Erklärungen, keine Kommentare.
```

**User Message:**
```json
{ "text": "Patientin berichtet von Lebensgefährten Jens..." }
```

---

## Step 3 — Verification Modal (UI)

New UX flow — the "Berichte" tab on the patient detail page drives the full workflow:

```
Therapist selects sessions + report type, clicks "Bericht generieren"
        ↓
New Server Action: getPseudonymizedTextForSessions(sessionIds)
  → fetches pseudonymized_notes + pseudonymized_next_plan for each session
  → if any session has pseudonymization_status "pending" → return { status: "pending" }
  → if any session has pseudonymization_status "failed"  → return { status: "failed" }
  → otherwise → return { status: "ready", text: combinedText }
        ↓
Modal opens (Datenschutz-Prüfung):
  ┌─────────────────────────────────────────────────┐
  │ Datenschutz-Prüfung                             │
  │                                                 │
  │ Bitte prüfen Sie ob alle personenbezogenen      │
  │ Daten entfernt wurden, bevor die Daten zur      │
  │ Berichtsgenerierung übertragen werden.          │
  │                                                 │
  │ [editable pseudonymized text]                   │
  │                                                 │
  │ [Abbrechen]  [Bestätigen & Bericht erstellen]   │
  └─────────────────────────────────────────────────┘
```

- If status is `"pending"`: button disabled, shows `⏳ Pseudonymisierung läuft...`
- If status is `"failed"`: shows `⚠️ Pseudonymisierung fehlgeschlagen` — worker will retry automatically
- Text is editable — therapist can manually fix any missed identifiers
- Edited text is passed to `generateReport()` but **not** written back to the DB

---

## Step 4 — `reports` DB Table & Model

Two migrations:

**`reports` table:**

| Field | Type | Notes |
|---|---|---|
| `id` | integer | PK |
| `patientId` | integer | FK patients |
| `therapeutId` | integer | nullable, FK therapeuts |
| `reportType` | text | `"Verlaufsbericht"` \| `"Konsiliarbericht"` |
| `dateFrom` | text | |
| `dateTo` | text | |
| `draftContent` | text | placeholders only, never real names |
| `approvedContent` | text | nullable, set on approval, still placeholders |
| `status` | text | `"pending"` \| `"draft"` \| `"approved"` |
| `approvedAt` | text | nullable |
| `createdAt` | text | |

**`report_sessions` join table** (replaces a JSON `sessionIds` column — keeps sessions queryable):

| Field | Type | Notes |
|---|---|---|
| `reportId` | integer | FK reports, PK |
| `sessionId` | integer | FK sessions, PK |

This enables queries in both directions:

```sql
-- All sessions in a report
SELECT s.* FROM sessions s
JOIN report_sessions rs ON rs.session_id = s.id
WHERE rs.report_id = 42;

-- All reports that include a specific session
SELECT r.* FROM reports r
JOIN report_sessions rs ON rs.report_id = r.id
WHERE rs.session_id = 7;
```

Deliverables: two migration files, `Report` model, `reportsRepository` following existing pattern.

---

## Step 5 — Report Generation: Service (`src/features/reports/reportGenerator.ts`)

Receives only pseudonymized data (from the verified modal text) and calls the Claude API.

### Prompt Architecture (`src/features/reports/prompts.ts`)

System prompt explains the JSON schema once, user message delivers only the data. This enables **Anthropic Prompt Caching** — the system prompt is only computed on the first call, then cached. Prompts remain in German as they instruct a German-language task.

**System Prompt:**
```
Du bist ein approbierter Psychotherapeut und Gutachter.

Du erhältst Therapiedaten als JSON mit folgender Struktur:
- diagnosis: ICD-10 Diagnose mit Klartext
- therapyForm: z.B. "Einzeltherapie"
- therapyStart: Datum des Therapiebeginns (ISO)
- approvedSessions: Anzahl bewilligter Sitzungen
- goals[]: Behandlungsziele mit description, status, priority
- sessions[]: Sitzungen mit:
    date: Datum (ISO)
    sessionNumber: laufende Nummer
    type: Sitzungstyp (z.B. "Erstgespräch", "Einzelgespräch")
    durationMinutes: Dauer in Minuten
    moodStart / moodEnd: Stimmung 1–10 zu Beginn und Ende
    riskLevel: Risikoniveau (none / low / medium / high / null)
    interventions[]: eingesetzte therapeutische Methoden
    notes: pseudonymisierte klinische Notizen
    nextPlan: pseudonymisierter Plan für nächste Sitzung
    homeworkGiven[]: erteilte Hausaufgaben
    homeworkReview[]: Review der Hausaufgaben aus Vorsitzung mit status (done/partial/open)

Alle Personennamen und Orte sind bereits pseudonymisiert ([Patient], [Person], [Ort] etc.).
Übernimm diese Platzhalter unverändert in den Bericht.

Verfasse einen formellen Verlaufsbericht für die gesetzliche Krankenkasse mit exakt diesen fünf Abschnitten:

1. Aktueller Behandlungsstatus
Diagnose, Therapiephase, Anzahl absolvierter Sitzungen im Berichtszeitraum. (2–3 Sätze)

2. Behandlungsverlauf
Chronologischer Verlauf. PHQ-9-Verlauf als Kurve benennen wenn vorhanden.
Hausaufgaben mit Compliance in der Folgesitzung verknüpfen. (4–6 Sätze)

3. Therapeutische Interventionen und deren Wirksamkeit
Eingesetzte Methoden mit konkreten Wirksamkeitsbelegen aus den Sitzungen. (3–5 Sätze)

4. Zielerreichung
Jedes Behandlungsziel einzeln bewerten. PHQ-9-Verlauf als objektiven Beleg nutzen.
Keine wörtlichen Zitate aus den Rohdaten. (3–5 Sätze)

5. Ausblick und weiteres Vorgehen
Notwendigkeit der Weiterbehandlung begründen. Konkrete nächste Schritte und Prognose. (3–4 Sätze)

Stilregeln:
- Durchgehend Behördendeutsch, dritte Person ("die Patientin")
- Kein Umgangssprachliches
- Keine klinischen Details erfinden die nicht im JSON stehen
- Fehlende PHQ-9-Werte als "nicht erhoben" kennzeichnen, nicht schätzen
- Prognosen nur auf Basis dokumentierter Beobachtungen formulieren
```

**User Message:**
```json
{
  "diagnosis": "F33.1 – Rezidivierende depressive Störung",
  "therapyForm": "Einzeltherapie",
  "therapyStart": "2025-01-15",
  "approvedSessions": 25,
  "goals": [
    { "description": "Depressive Symptomatik reduzieren (PHQ-9 < 5)", "status": "active", "priority": 1 }
  ],
  "sessions": [
    {
      "date": "2025-02-03",
      "sessionNumber": 1,
      "type": "Erstgespräch",
      "durationMinutes": 100,
      "moodStart": 3,
      "moodEnd": 4,
      "riskLevel": "none",
      "interventions": ["Psychoedukation", "Aktives Zuhören"],
      "notes": "Patientin berichtet von anhaltend gedrückter Stimmung...",
      "nextPlan": "Stimmungstagebuch einführen...",
      "homeworkGiven": ["Stimmungstagebuch täglich ausfüllen"],
      "homeworkReview": []
    }
  ]
}
```

The response is stored as `draftContent` — placeholders intact, no real names ever stored.

**Server Action** `generateReport(patientId, reportType, sessionIds)`:
1. Creates a `reports` row with `status: "pending"`
2. Inserts a `report_sessions` row per session
3. Writes an outbox event in the same transaction
4. Returns `reportId` immediately — UI polls status from there

The worker picks up the job, calls Claude, and updates `draftContent` + `status: "draft"` when done.

---

## Step 6 — Report UI

New "Berichte" tab on the patient detail page.

### Generating a report

1. Therapist selects sessions + report type, clicks **"Bericht generieren"**
2. `getPseudonymizedTextForSessions()` is called → verification modal opens (Step 3)
3. After confirmation, `generateReport()` Server Action is called → returns `reportId` immediately
4. UI switches to the report detail view and polls `getReportStatus(reportId)` via TanStack Query at 1s interval
5. While `status: "pending"`: show *"Befund wird erstellt..."* spinner
6. When `status: "draft"`: render `draftContent` with banner:
   > KI-Entwurf — Prüfung und Freigabe durch Therapeut:in erforderlich
7. Draft is displayed as formatted text (no rich text editor for now)
8. **"Freigeben"** → sets `approvedContent = draftContent`, status → `"approved"`
9. **"Verwerfen"** → deletes the report row

### Report list

Approved and draft reports listed in the tab with date, type, and status chip.

---

## Step 7 — Export (Out of Scope for Phase 2)

Export (placeholder substitution → DOCX/PDF) is deferred to Phase 3. For now, approved reports are read directly in the UI. Real names are never stored in the DB.

---

## Local Development Setup

### Docker Compose

Ollama and the worker process are both defined in `docker-compose.yml`:

```yaml
ollama:
  image: ollama/ollama:latest
  ports:
    - "11434:11434"
  volumes:
    - ollama_data:/root/.ollama
  healthcheck:
    test: ["CMD-SHELL", "curl -sf http://localhost:11434/api/tags || exit 1"]
    interval: 10s
    timeout: 5s
    retries: 10
    start_period: 30s

worker:
  build: .
  command: npx tsx src/worker.ts
  depends_on:
    db:
      condition: service_healthy
    ollama:
      condition: service_healthy
  environment:
    - DATABASE_URL=${DATABASE_URL}
    - OLLAMA_URL=http://ollama:11434
    - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
```

`src/worker.ts` polls the outbox table in a loop and calls `processJob()` for each unprocessed event. The Next.js app and worker share the same DB and codebase — no extra dependencies needed.

### First-time model pull

```bash
# Production model
docker compose exec ollama ollama pull mistral

# Lightweight stand-in for local dev / CI (quality irrelevant for pipeline tests)
docker compose exec ollama ollama pull tinyllama
```

### Environment variables

| Variable | Development | Docker stack |
|---|---|---|
| `OLLAMA_URL` | `http://localhost:11434` | `http://ollama:11434` |
| `ANTHROPIC_API_KEY` | your key | secret / env inject |
| `LLM_MODEL` | `claude-sonnet-4-6` | swappable via env |

### Testing strategy

- `tinyllama` in e2e / CI — verifies pipeline runs end-to-end, not pseudonymization quality
- `mistral` locally — test actual pseudonymization quality
- Mock Claude API calls at the `reportGenerator.ts` boundary in tests

---

## Open Questions

1. **Token limit strategy** — patients with 40+ sessions may exceed Claude's context window. Options: summarize older sessions, truncate, or warn therapist to narrow the date range.
2. **Ollama unavailable fallback** — block report generation or fall back to rule-based pass only?
3. **Retry limit** — the worker retries failed jobs indefinitely. Should there be a max retry count before marking a job permanently failed?

---

## Out of Scope for Phase 2

- Questionnaire score tracking (BDI, PHQ-9, GAD-7) → Phase 3
- Progress dashboard / charts → Phase 3
