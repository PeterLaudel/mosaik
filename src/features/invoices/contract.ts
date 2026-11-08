import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import { z } from "zod";

// The invoices feature owns its own view of patients, services and the therapeut. Each schema
// holds only the fields an invoice needs and is read straight from the shared tables by the
// invoices repository, so this feature never imports another feature's contract.

/** GOÄ multiplier a position is billed at. */
export const factorSchema = z.enum(["1.0", "1.8", "2.3"]);

export const invoiceStatusSchema = z.enum(["pending", "sent", "paid"]);

export const invoiceAddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zip: z.string(),
});

export const invoiceBillingInfoSchema = z.object({
  name: z.string(),
  surname: z.string(),
  email: z.string(),
  address: invoiceAddressSchema,
});

export const invoicePatientSchema = z.object({
  id: z.number(),
  name: z.string(),
  surname: z.string(),
  birthdate: z.string(),
  diagnosis: z.string().nullable(),
  billingInfo: invoiceBillingInfoSchema,
  invoicePassword: z.string().nullable(),
});

/** A catalog service as an invoice position sees it: what to print and what it costs. */
export const billableServiceSchema = z.object({
  id: z.number(),
  short: z.string(),
  originalGopNr: z.string(),
  description: z.string(),
  amounts: z.array(z.object({ factor: factorSchema, price: z.number() })),
});

/** The therapeut who issues and signs the invoice. */
export const invoiceIssuerSchema = z.object({
  id: z.number(),
  title: z.string(),
  name: z.string(),
  surname: z.string(),
  street: z.string(),
  zip: z.string(),
  city: z.string(),
  email: z.string(),
  taxId: z.string(),
  iban: z.string(),
  bic: z.string(),
  bankName: z.string(),
  enr: z.string(),
});

export const invoicePositionSchema = z.object({
  serviceDate: z.string(),
  service: billableServiceSchema,
  amount: z.number(),
  factor: factorSchema,
  price: z.number(),
});

export const invoiceSchema = z.object({
  id: z.number(),
  base64Pdf: z.string(),
  invoiceNumber: z.string(),
  invoiceAmount: z.number(),
  status: invoiceStatusSchema,
  positions: z.array(invoicePositionSchema),
  patient: invoicePatientSchema,
});

export const invoiceCreateSchema = invoiceSchema.omit({ id: true });

export const createPdfParamsSchema = z.object({
  patient: invoicePatientSchema.optional(),
  therapeut: invoiceIssuerSchema,
  invoiceNumber: z.string(),
  invoiceDate: z.string().optional(),
  positions: z.array(invoicePositionSchema),
  invoiceAmount: z.number(),
  options: z.object({ invoicePassword: z.string().optional() }).optional(),
});

const idInput = z.object({ id: z.coerce.number() });

const invoiceNumberInput = z.object({ invoiceNumber: z.string() });

const filterInput = z.object({
  search: z.string().optional(),
  status: invoiceStatusSchema.optional(),
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

const filterOutput = z.object({
  rows: z.array(invoiceSchema),
  total: z.number(),
});

// Path params arrive as strings and override body fields, so the id is coerced
const updateInput = invoiceSchema.extend({ id: z.coerce.number() });

const updateStatusInput = z.object({
  id: z.coerce.number(),
  status: invoiceStatusSchema,
});

const pdfOutput = z.instanceof(File);

export const invoicesContract = {
  filter: oc
    .meta(openapi({ method: "GET", path: "/invoices" }))
    .input(filterInput)
    .output(filterOutput),
  // Static paths are registered before /invoices/{id} so they are not captured as an id
  downloadPdf: oc
    .meta(openapi({ method: "GET", path: "/invoices/by-number/{invoiceNumber}/pdf" }))
    .input(invoiceNumberInput)
    .output(pdfOutput),
  findPatients: oc
    .meta(openapi({ method: "GET", path: "/invoices/patients" }))
    .output(z.array(invoicePatientSchema)),
  findBillableServices: oc
    .meta(openapi({ method: "GET", path: "/invoices/billable-services" }))
    .output(z.array(billableServiceSchema)),
  findIssuer: oc
    .meta(openapi({ method: "GET", path: "/invoices/issuer" }))
    .output(invoiceIssuerSchema.nullable()),
  generateInvoiceNumber: oc
    .meta(openapi({ method: "POST", path: "/invoices/invoice-number" }))
    .output(z.string()),
  find: oc
    .meta(openapi({ method: "GET", path: "/invoices/{id}" }))
    .input(idInput)
    .output(invoiceSchema),
  generatePdf: oc
    .meta(openapi({ method: "POST", path: "/invoices/pdf" }))
    .input(createPdfParamsSchema)
    .output(pdfOutput),
  create: oc
    .meta(openapi({ method: "POST", path: "/invoices" }))
    .input(invoiceCreateSchema)
    .output(invoiceSchema),
  update: oc
    .meta(openapi({ method: "PUT", path: "/invoices/{id}" }))
    .input(updateInput)
    .output(invoiceSchema),
  updateStatus: oc
    .meta(openapi({ method: "PUT", path: "/invoices/{id}/status" }))
    .input(updateStatusInput)
    .output(invoiceSchema),
  sendByEmail: oc
    .meta(openapi({ method: "POST", path: "/invoices/{id}/send" }))
    .input(idInput)
    .output(invoiceSchema),
  delete: oc
    .meta(openapi({ method: "DELETE", path: "/invoices/{id}" }))
    .input(idInput)
    .output(z.void()),
};
