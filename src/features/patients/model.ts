import { z } from "zod";
import { addressSchema, billingInfoSchema, patientCreateSchema, patientSchema } from "./contract";

export type Address = z.infer<typeof addressSchema>;
export type BillingInfo = z.infer<typeof billingInfoSchema>;
export type Patient = z.infer<typeof patientSchema>;
export type PatientCreate = z.infer<typeof patientCreateSchema>;
