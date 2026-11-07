import { z } from "zod";
import { factorArray } from "@/features/services/model";

export const serviceSchema = z.object({
  short: z.string().min(1, "Kürzel ist erforderlich"),
  originalGopNr: z.string().min(1, "GOP-Nr ist erforderlich"),
  description: z.string().min(1, "Beschreibung ist erforderlich"),
  note: z.string().optional(),
  points: z.number().min(0, "Punkte müssen positiv sein"),
  amounts: z.array(
    z.object({
      factor: z.enum(factorArray),
      price: z.number().positive("Preis muss positiv sein").optional(),
    })
  ).length(3),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
