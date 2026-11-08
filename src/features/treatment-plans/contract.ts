import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import { z } from "zod";

export const therapyFormSchema = z.enum(["Einzeltherapie", "Gruppentherapie", "Probatorik"]);
export const treatmentPhaseSchema = z.enum(["Diagnostik", "Therapiephase", "Abschluss"]);
export const goalStatusSchema = z.enum(["active", "achieved", "abandoned"]);

export const treatmentGoalSchema = z.object({
  description: z.string(),
  status: goalStatusSchema,
  priority: z.number(),
});

// A treatment plan only needs to know which patient it belongs to; pages that show patient
// details read them through the patients feature.
export const treatmentPlanPatientSchema = z.object({ id: z.number() });

export const treatmentPlanSchema = z.object({
  id: z.number(),
  patient: treatmentPlanPatientSchema,
  therapeutId: z.number().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  therapyForm: therapyFormSchema,
  phase: treatmentPhaseSchema,
  approvedSessions: z.number().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  goals: z.array(treatmentGoalSchema),
});

export const treatmentPlanFormDataSchema = treatmentPlanSchema.pick({
  startDate: true,
  endDate: true,
  therapyForm: true,
  phase: true,
  approvedSessions: true,
  notes: true,
  goals: true,
});

const patientIdInput = z.object({ patientId: z.coerce.number() });

const createInput = treatmentPlanFormDataSchema.extend({ patientId: z.coerce.number() });

const updateInput = treatmentPlanFormDataSchema.extend({ id: z.coerce.number() });

export const treatmentPlansContract = {
  findByPatientId: oc
    .meta(openapi({ method: "GET", path: "/patients/{patientId}/treatment-plan" }))
    .input(patientIdInput)
    .output(treatmentPlanSchema.nullable()),
  create: oc
    .meta(openapi({ method: "POST", path: "/patients/{patientId}/treatment-plan" }))
    .input(createInput)
    .output(treatmentPlanSchema),
  update: oc
    .meta(openapi({ method: "PUT", path: "/treatment-plans/{id}" }))
    .input(updateInput)
    .output(treatmentPlanSchema),
};
