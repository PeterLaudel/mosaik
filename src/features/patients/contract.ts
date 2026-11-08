import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import { z } from "zod";

export const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zip: z.string(),
});

export const billingInfoSchema = z.object({
  name: z.string(),
  surname: z.string(),
  email: z.string(),
  address: addressSchema,
});

export const patientSchema = z.object({
  id: z.number(),
  name: z.string(),
  surname: z.string(),
  email: z.string(),
  birthdate: z.string(),
  address: addressSchema,
  diagnosis: z.string().nullable(),
  billingInfo: billingInfoSchema,
  invoicePassword: z.string().nullable(),
});

export const patientCreateSchema = patientSchema.omit({ id: true });

const idInput = z.object({ id: z.coerce.number() });

// Path params arrive as strings and override body fields, so the id is coerced
const updateInput = patientSchema.extend({ id: z.coerce.number() });

const filterInput = z.object({
  search: z.string().default(""),
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

const filterOutput = z.object({
  rows: z.array(patientSchema),
  total: z.number(),
});

export const patientsContract = {
  filter: oc
    .meta(openapi({ method: "GET", path: "/patients" }))
    .input(filterInput)
    .output(filterOutput),
  find: oc
    .meta(openapi({ method: "GET", path: "/patients/{id}" }))
    .input(idInput)
    .output(patientSchema),
  create: oc
    .meta(openapi({ method: "POST", path: "/patients" }))
    .input(patientCreateSchema)
    .output(patientSchema),
  update: oc
    .meta(openapi({ method: "PUT", path: "/patients/{id}" }))
    .input(updateInput)
    .output(patientSchema),
};
