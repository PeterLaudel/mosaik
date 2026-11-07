import * as z from "zod";

export const therapeutSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Titel ist erforderlich"),
  name: z.string().min(1, "Name ist erforderlich"),
  surname: z.string().min(1, "Vorname ist erforderlich"),
  street: z.string().min(1, "Straße ist erforderlich"),
  zip: z.string().min(1, "PLZ ist erforderlich"),
  city: z.string().min(1, "Ort ist erforderlich"),
  email: z.email("E-Mail ist ungültig"),
  phone: z.string().min(1, "Telefon ist erforderlich"),
  taxId: z.string().min(1, "Steuer-ID ist erforderlich"),
  bankName: z.string().min(1, "Bankname ist erforderlich"),
  iban: z.string().min(1, "IBAN ist erforderlich"),
  bic: z.string().min(1, "BIC ist erforderlich"),
  website: z.string().min(1, "Webseite ist ungültig"),
  enr: z.string().min(1, "ENR ist erforderlich"),
});

export type TherapeutFormData = z.infer<typeof therapeutSchema>;
