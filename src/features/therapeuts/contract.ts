import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import { z } from "zod";

export const therapeutSchema = z.object({
  id: z.number(),
  title: z.string(),
  name: z.string(),
  surname: z.string(),
  street: z.string(),
  zip: z.string(),
  city: z.string(),
  email: z.string(),
  phone: z.string(),
  taxId: z.string(),
  iban: z.string(),
  bic: z.string(),
  bankName: z.string(),
  website: z.string(),
  enr: z.string(),
});

export const therapeutCreateSchema = therapeutSchema.omit({ id: true });

// Path params arrive as strings and override body fields, so the id is coerced
const updateInput = therapeutSchema.extend({ id: z.coerce.number() });

export const therapeutsContract = {
  all: oc
    .meta(openapi({ method: "GET", path: "/therapeuts" }))
    .output(z.array(therapeutSchema)),
  create: oc
    .meta(openapi({ method: "POST", path: "/therapeuts" }))
    .input(therapeutCreateSchema)
    .output(therapeutSchema),
  update: oc
    .meta(openapi({ method: "PUT", path: "/therapeuts/{id}" }))
    .input(updateInput)
    .output(therapeutSchema),
};
