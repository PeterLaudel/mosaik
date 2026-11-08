// Root oRPC contract: the API surface clients (mosaik-ui) are built against, published as
// @peterlaudel/mosaik-contract. Imports only contract files so the bundle carries no backend runtime.
import type { z } from "zod";
import { authContract, currentUserSchema } from "@/auth/contract";
import {
  billableServiceSchema,
  createPdfParamsSchema,
  invoiceCreateSchema,
  invoiceIssuerSchema,
  invoicePatientSchema,
  invoiceSchema,
  invoiceStatusSchema,
  invoicesContract,
} from "@/features/invoices/contract";
import { patientCreateSchema, patientSchema, patientsContract } from "@/features/patients/contract";
import {
  factorSchema,
  serviceCreateSchema,
  serviceSchema,
  servicesContract,
} from "@/features/services/contract";
import {
  homeworkStatusSchema,
  pseudonymizationCheckResultSchema,
  riskLevelSchema,
  sessionCreateSchema,
  sessionPhaseSchema,
  sessionSchema,
  sessionTypeSchema,
  sessionsContract,
} from "@/features/sessions/contract";
import {
  therapeutCreateSchema,
  therapeutSchema,
  therapeutsContract,
} from "@/features/therapeuts/contract";
import {
  goalStatusSchema,
  therapyFormSchema,
  treatmentPhaseSchema,
  treatmentPlanFormDataSchema,
  treatmentPlanSchema,
  treatmentPlansContract,
} from "@/features/treatment-plans/contract";

export const contract = {
  auth: authContract,
  invoices: invoicesContract,
  patients: patientsContract,
  services: servicesContract,
  sessions: sessionsContract,
  therapeuts: therapeutsContract,
  treatmentPlans: treatmentPlansContract,
};

export type Contract = typeof contract;

// Domain types and enum values for clients, derived from the same schemas the API validates with.

export type CurrentUser = z.infer<typeof currentUserSchema>;

export type Patient = z.infer<typeof patientSchema>;
export type PatientCreate = z.infer<typeof patientCreateSchema>;

/** GOÄ multiplier a service is billed at. */
export const FACTORS = factorSchema.options;
export type Factor = z.infer<typeof factorSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type ServiceCreate = z.infer<typeof serviceCreateSchema>;

export type Therapeut = z.infer<typeof therapeutSchema>;
export type TherapeutCreate = z.infer<typeof therapeutCreateSchema>;

export const INVOICE_STATUSES = invoiceStatusSchema.options;
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceCreate = z.infer<typeof invoiceCreateSchema>;
export type InvoicePatient = z.infer<typeof invoicePatientSchema>;
export type InvoiceIssuer = z.infer<typeof invoiceIssuerSchema>;
export type BillableService = z.infer<typeof billableServiceSchema>;
export type CreatePdfParams = z.infer<typeof createPdfParamsSchema>;

export const SESSION_TYPES = sessionTypeSchema.options;
export const SESSION_PHASES = sessionPhaseSchema.options;
export const RISK_LEVEL_VALUES = riskLevelSchema.options;
export const HOMEWORK_STATUS_VALUES = homeworkStatusSchema.options;
export type SessionType = z.infer<typeof sessionTypeSchema>;
export type SessionPhase = z.infer<typeof sessionPhaseSchema>;
export type RiskLevel = z.infer<typeof riskLevelSchema>;
export type HomeworkStatus = z.infer<typeof homeworkStatusSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type SessionCreate = z.infer<typeof sessionCreateSchema>;
export type PseudonymizationCheckResult = z.infer<typeof pseudonymizationCheckResultSchema>;

export const THERAPY_FORMS = therapyFormSchema.options;
export const TREATMENT_PHASES = treatmentPhaseSchema.options;
export const GOAL_STATUS_VALUES = goalStatusSchema.options;
export type TherapyForm = z.infer<typeof therapyFormSchema>;
export type TreatmentPhase = z.infer<typeof treatmentPhaseSchema>;
export type GoalStatus = z.infer<typeof goalStatusSchema>;
export type TreatmentPlan = z.infer<typeof treatmentPlanSchema>;
export type TreatmentPlanFormData = z.infer<typeof treatmentPlanFormDataSchema>;
