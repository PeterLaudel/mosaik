import { z } from "zod";
import { amountSchema, factorSchema, serviceCreateSchema, serviceSchema } from "./contract";

export const factorArray = factorSchema.options;
export type Factor = z.infer<typeof factorSchema>;
export type Amount = z.infer<typeof amountSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type ServiceCreate = z.infer<typeof serviceCreateSchema>;
