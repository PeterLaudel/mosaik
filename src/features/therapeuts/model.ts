import { z } from "zod";
import { therapeutCreateSchema, therapeutSchema } from "./contract";

export type Therapeut = z.infer<typeof therapeutSchema>;
export type TherapeutCreate = z.infer<typeof therapeutCreateSchema>;
