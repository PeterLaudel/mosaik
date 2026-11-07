import { z } from "zod";
import { patientSchema } from "@mosaik/contract";

// Field rules come from the API contract; the form adds UI-only toggles on top
export const patientFormSchema = patientSchema.extend({
  id: z.number().optional(),
  diagnosis: z.string().nullable().optional(),
  invoicePassword: z.string().nullable().optional(),
  billingInfoIsPatient: z.boolean(),
  enableInvoiceEncryption: z.boolean(),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;
