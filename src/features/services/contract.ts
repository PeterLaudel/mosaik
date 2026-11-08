import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import { z } from "zod";

export const factorSchema = z.enum(["1.0", "1.8", "2.3"]);

export const amountSchema = z.object({
  factor: factorSchema,
  price: z.number(),
});

export const serviceSchema = z.object({
  id: z.number(),
  short: z.string(),
  originalGopNr: z.string(),
  description: z.string(),
  note: z.string().optional(),
  points: z.number(),
  amounts: z.array(amountSchema),
});

export const serviceCreateSchema = serviceSchema.omit({ id: true });

const idInput = z.object({ id: z.coerce.number() });

// Path params arrive as strings and override body fields, so the id is coerced
const updateInput = serviceSchema.extend({ id: z.coerce.number() });

const filterInput = z.object({
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

const filterOutput = z.object({
  rows: z.array(serviceSchema),
  total: z.number(),
});

export const servicesContract = {
  filter: oc
    .meta(openapi({ method: "GET", path: "/services" }))
    .input(filterInput)
    .output(filterOutput),
  find: oc
    .meta(openapi({ method: "GET", path: "/services/{id}" }))
    .input(idInput)
    .output(serviceSchema),
  create: oc
    .meta(openapi({ method: "POST", path: "/services" }))
    .input(serviceCreateSchema)
    .output(serviceSchema),
  update: oc
    .meta(openapi({ method: "PUT", path: "/services/{id}" }))
    .input(updateInput)
    .output(serviceSchema),
};
