import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import { z } from "zod";

export const sessionTypeSchema = z.enum([
  "Erstgespräch",
  "Probatorik",
  "Einzelgespräch",
  "Telefon",
  "Gruppentherapie",
]);
export const sessionPhaseSchema = z.enum(["Diagnostik", "Therapiephase", "Abschluss"]);
export const riskLevelSchema = z.enum(["none", "low", "moderate", "high"]);
export const sessionStatusSchema = z.enum(["draft", "final"]);
export const pseudonymizationStatusSchema = z.enum(["pending", "done", "failed"]);
export const homeworkStatusSchema = z.enum(["open", "done", "partial", "not_done"]);

export const givenHomeworkSchema = z.object({ description: z.string() });

export const reviewHomeworkSchema = z.object({
  description: z.string(),
  status: homeworkStatusSchema,
});

// Sessions own their view of the patient: just what the session pages show and what
// pseudonymization needs to strip out. It is read from the patients table by this feature's
// selector, not imported from the patients feature.
export const sessionPatientSchema = z.object({
  id: z.number(),
  name: z.string(),
  surname: z.string(),
  birthdate: z.string(),
  address: z.object({ street: z.string(), city: z.string(), zip: z.string() }),
});

export const sessionSchema = z.object({
  id: z.number(),
  therapeutId: z.number().nullable(),
  sessionDate: z.string(),
  sessionNumber: z.number(),
  durationMinutes: z.number(),
  sessionType: sessionTypeSchema,
  phase: sessionPhaseSchema.nullable(),
  moodStart: z.number().nullable(),
  moodEnd: z.number().nullable(),
  riskLevel: riskLevelSchema.nullable(),
  interventions: z.array(z.string()),
  clinicalNotes: z.string().nullable(),
  nextSessionPlan: z.string().nullable(),
  status: sessionStatusSchema,
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  patient: sessionPatientSchema,
  givenHomework: z.array(givenHomeworkSchema),
  reviewHomework: z.array(reviewHomeworkSchema),
  pseudonymizedNotes: z.string().nullable(),
  pseudonymizedNextPlan: z.string().nullable(),
  pseudonymizationStatus: pseudonymizationStatusSchema.nullable(),
});

export const sessionCreateSchema = sessionSchema.omit({ id: true, createdAt: true });

export const pseudonymizationCheckResultSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("pending") }),
  z.object({ status: z.literal("failed") }),
  z.object({ status: z.literal("ready"), text: z.string() }),
]);

const idInput = z.object({ id: z.coerce.number() });

const patientIdInput = z.object({ patientId: z.coerce.number() });

const filterInput = z.object({
  patientId: z.coerce.number().optional(),
  status: sessionStatusSchema.optional(),
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

const filterOutput = z.object({
  rows: z.array(sessionSchema),
  total: z.number(),
});

const previousSessionInput = z.object({
  patientId: z.coerce.number(),
  sessionNumber: z.coerce.number(),
});

const updateInput = sessionCreateSchema.partial().extend({ id: z.coerce.number() });

const pseudonymizedTextInput = z.object({ sessionIds: z.array(z.number()) });

export const sessionsContract = {
  filter: oc
    .meta(openapi({ method: "GET", path: "/sessions" }))
    .input(filterInput)
    .output(filterOutput),
  find: oc
    .meta(openapi({ method: "GET", path: "/sessions/{id}" }))
    .input(idInput)
    .output(sessionSchema),
  findOpenSession: oc
    .meta(openapi({ method: "GET", path: "/patients/{patientId}/sessions/open" }))
    .input(patientIdInput)
    .output(sessionSchema.nullable()),
  findPreviousSession: oc
    .meta(openapi({ method: "GET", path: "/patients/{patientId}/sessions/previous" }))
    .input(previousSessionInput)
    .output(sessionSchema.nullable()),
  createDraft: oc
    .meta(openapi({ method: "POST", path: "/patients/{patientId}/sessions" }))
    .input(patientIdInput)
    .output(sessionSchema),
  update: oc
    .meta(openapi({ method: "PATCH", path: "/sessions/{id}" }))
    .input(updateInput)
    .output(sessionSchema),
  getPseudonymizedText: oc
    .meta(openapi({ method: "POST", path: "/sessions/pseudonymized-text" }))
    .input(pseudonymizedTextInput)
    .output(pseudonymizationCheckResultSchema),
};
