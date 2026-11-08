import { z } from "zod";

const addressSchema = z.object({
  street: z.string().min(1, "Dieses Feld ist erforderlich"),
  zip: z.string().regex(/^\d{5}$/, "Bitte geben Sie eine gültige Postleitzahl ein"),
  city: z.string().min(1, "Dieses Feld ist erforderlich"),
});

export const patientFormSchema = z.object({
  name: z.string().min(1, "Dieses Feld ist erforderlich"),
  surname: z.string().min(1, "Dieses Feld ist erforderlich"),
  email: z.email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  birthdate: z.string().min(1, "Dieses Feld ist erforderlich"),
  address: addressSchema,
  diagnosis: z.string().nullable().optional(),
  billingInfo: z.object({
    name: z.string().min(1, "Dieses Feld ist erforderlich"),
    surname: z.string().min(1, "Dieses Feld ist erforderlich"),
    email: z.email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
    address: addressSchema,
  }),
  invoicePassword: z.string().nullable().optional(),
  billingInfoIsPatient: z.boolean(),
  enableInvoiceEncryption: z.boolean(),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;
