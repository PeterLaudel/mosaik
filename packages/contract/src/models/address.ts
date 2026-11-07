import { z } from "zod";

const REQUIRED = "Dieses Feld ist erforderlich";

export const addressSchema = z.object({
  street: z.string().min(1, REQUIRED),
  zip: z.string().regex(/^\d{5}$/, "Bitte geben Sie eine gültige Postleitzahl ein"),
  city: z.string().min(1, REQUIRED),
});

type Address = z.infer<typeof addressSchema>;
export default Address;
