import { Generated } from "kysely";

export interface Database {
  patients: PatientTable;
  invoices: InvoicesTable;
  invoicePositions: InvoicePositionsTable;
  patientInvoices: PatientInvoiceTable;
  services: ServicesTable;
  serviceAmounts: ServiceAmountsTable;
  therapeuts: TherapeutsTable;
  sessions: SessionsTable;
  treatment_plans: TreatmentPlansTable;
  treatment_goals: TreatmentGoalsTable;
  homework: HomeworkTable;
  outbox: OutboxTable;
}

interface PatientTable {
  id: Generated<number>;
  name: string;
  surname: string;
  email: string;
  birthdate: string;
  street: string;
  city: string;
  zip: string;
  diagnosis: string | null;
  billingName: string;
  billingSurname: string;
  billingEmail: string;
  billingStreet: string;
  billingCity: string;
  billingZip: string;
  invoicePassword: string | null;
}

export interface InvoicesTable {
  id: Generated<number>;
  invoiceNumber: string;
  base64Pdf: string;
  invoiceAmount: number;
  status: "pending" | "sent" | "paid";
  createdAt: Generated<string>;
}

export interface InvoicePositionsTable {
  id: Generated<number>;
  invoiceId: number;
  serviceId: number;
  serviceDate: string;
  amount: number;
  factor: "1.0" | "1.8" | "2.3";
  price: number;
}

export interface PatientInvoiceTable {
  id: Generated<number>;
  patientId: number;
  invoiceId: number;
}

interface ServicesTable {
  id: Generated<number>;
  short: string;
  originalGopNr: string;
  description: string;
  points: number;
  note?: string;
}

interface ServiceAmountsTable {
  id: Generated<number>;
  serviceId: number;
  factor: "1.0" | "1.8" | "2.3";
  price: number;
}

interface TherapeutsTable {
  id: Generated<number>;
  title: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
  taxId: string;
  iban: string;
  bic: string;
  bankName: string;
  website: string;
  enr: string;
}

export interface SessionsTable {
  id: Generated<number>;
  patientId: number;
  therapeutId: number | null;
  sessionDate: string;
  sessionNumber: number;
  durationMinutes: Generated<number>;
  sessionType: string;
  phase: string | null;
  moodStart: number | null;
  moodEnd: number | null;
  riskLevel: string | null;
  interventions: string;
  clinicalNotes: string | null;
  nextSessionPlan: string | null;
  status: "draft" | "final";
  deletedAt: string | null;
  createdAt: Generated<string>;
  pseudonymizedNotes: string | null;
  pseudonymizedNextPlan: string | null;
  pseudonymizationStatus: "pending" | "done" | "failed" | null;
}

export interface TreatmentPlansTable {
  id: Generated<number>;
  patientId: number;
  therapeutId: number | null;
  startDate: string;
  endDate: string | null;
  therapyForm: string;
  phase: string;
  approvedSessions: number | null;
  notes: string | null;
  createdAt: Generated<string>;
}

export interface TreatmentGoalsTable {
  id: Generated<number>;
  treatmentPlanId: number;
  description: string;
  status: string;
  priority: number;
  createdAt: Generated<string>;
}

export interface HomeworkTable {
  id: Generated<number>;
  sessionId: number;
  type: "given" | "review";
  description: string;
  status: string | null; // null for given items, HomeworkStatus for review items
  createdAt: Generated<string>;
}

export interface OutboxTable {
  id: Generated<number>;
  eventType: string;
  payload: string;
  processedAt: string | null;
  createdAt: Generated<string>;
}
