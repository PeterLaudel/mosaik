import { z } from "zod";
import { addressSchema } from "./address";

const REQUIRED = "Dieses Feld ist erforderlich";
const INVALID_EMAIL = "Bitte geben Sie eine gültige E-Mail-Adresse ein";

export const billingInfoSchema = z.object({
  name: z.string().min(1, REQUIRED),
  surname: z.string().min(1, REQUIRED),
  email: z.email(INVALID_EMAIL),
  address: addressSchema,
});

export const patientSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, REQUIRED),
  surname: z.string().min(1, REQUIRED),
  email: z.email(INVALID_EMAIL),
  birthdate: z.string().min(1, REQUIRED),
  address: addressSchema,
  diagnosis: z.string().nullable(),
  billingInfo: billingInfoSchema,
  invoicePassword: z.string().nullable(),
});

/** Payload for creating a patient (no id yet). */
export const patientCreateSchema = patientSchema.omit({ id: true });

export type BillingInfo = z.infer<typeof billingInfoSchema>;
export type Patient = z.infer<typeof patientSchema>;
export type PatientCreate = z.infer<typeof patientCreateSchema>;
