import { z } from "zod";
import {
  billableServiceSchema,
  factorSchema,
  invoiceAddressSchema,
  invoiceBillingInfoSchema,
  invoiceCreateSchema,
  invoiceIssuerSchema,
  invoicePatientSchema,
  invoicePositionSchema,
  invoiceSchema,
} from "./contract";

// The invoices feature owns its own view of patients, services and the therapeut. Each type
// holds only the fields an invoice needs and is read straight from the shared tables by the
// invoices repository, so this feature never imports another feature's model.

/** GOÄ multiplier a position is billed at. */
export type Factor = z.infer<typeof factorSchema>;
export type InvoiceAddress = z.infer<typeof invoiceAddressSchema>;
export type InvoiceBillingInfo = z.infer<typeof invoiceBillingInfoSchema>;
export type InvoicePatient = z.infer<typeof invoicePatientSchema>;
export type BillableService = z.infer<typeof billableServiceSchema>;
export type InvoiceIssuer = z.infer<typeof invoiceIssuerSchema>;
export type InvoicePosition = z.infer<typeof invoicePositionSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceCreate = z.infer<typeof invoiceCreateSchema>;
