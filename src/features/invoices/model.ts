// The invoices feature owns its own view of patients, services and the therapeut. Each type
// holds only the fields an invoice needs and is read straight from the shared tables by the
// invoices repository, so this feature never imports another feature's model.

/** GOÄ multiplier a position is billed at. */
export type Factor = "1.0" | "1.8" | "2.3";

export interface InvoiceAddress {
  street: string;
  city: string;
  zip: string;
}

export interface InvoiceBillingInfo {
  name: string;
  surname: string;
  email: string;
  address: InvoiceAddress;
}

export interface InvoicePatient {
  id: number;
  name: string;
  surname: string;
  birthdate: string;
  diagnosis: string | null;
  billingInfo: InvoiceBillingInfo;
  invoicePassword: string | null;
}

/** A catalog service as an invoice position sees it: what to print and what it costs. */
export interface BillableService {
  id: number;
  short: string;
  originalGopNr: string;
  description: string;
  amounts: { factor: Factor; price: number }[];
}

/** The therapeut who issues and signs the invoice. */
export interface InvoiceIssuer {
  id: number;
  title: string;
  name: string;
  surname: string;
  street: string;
  zip: string;
  city: string;
  email: string;
  taxId: string;
  iban: string;
  bic: string;
  bankName: string;
  enr: string;
}

export interface InvoicePosition {
  serviceDate: string;
  service: BillableService;
  amount: number;
  factor: Factor;
  price: number;
}

export interface Invoice {
  id: number;
  base64Pdf: string;
  invoiceNumber: string;
  invoiceAmount: number;
  status: "pending" | "sent" | "paid";
  positions: InvoicePosition[];
  patient: InvoicePatient;
}

export type InvoiceCreate = Omit<Invoice, "id">;
