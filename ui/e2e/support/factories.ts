import type {
  BillableService,
  Invoice,
  InvoiceIssuer,
  InvoicePatient,
  Patient,
  Service,
  Session,
  Therapeut,
  TreatmentPlan,
} from "@peterlaudel/mosaik-contract";

// API responses with readable defaults; pass overrides for what a test cares about.

let lastId = 0;
const nextId = () => ++lastId;
const address = { street: "Musterstraße 1", city: "Musterstadt", zip: "12345" };

const patient = (o: Partial<Patient> = {}): Patient => ({
  id: nextId(),
  name: "Max",
  surname: "Mustermann",
  email: "max@example.com",
  birthdate: "1980-01-01",
  address,
  diagnosis: null,
  billingInfo: { name: "Max", surname: "Mustermann", email: "max@example.com", address },
  invoicePassword: null,
  ...o,
});

const service = (o: Partial<Service> = {}): Service => ({
  id: nextId(),
  short: "P1",
  originalGopNr: "870",
  description: "Einzelbehandlung",
  points: 750,
  amounts: [{ factor: "1.0", price: 43.72 }],
  ...o,
});

const therapeut = (o: Partial<Therapeut> = {}): Therapeut => ({
  id: nextId(),
  title: "Dr.",
  name: "Erika",
  surname: "Musterfrau",
  street: "Praxisweg 2",
  zip: "12345",
  city: "Musterstadt",
  email: "praxis@example.com",
  phone: "0123 456789",
  taxId: "12345678901",
  iban: "DE89370400440532013000",
  bic: "COBADEFFXXX",
  bankName: "Musterbank",
  website: "https://example.com",
  enr: "123456789",
  ...o,
});

/** The therapeut as the invoices feature sees them. */
const issuer = (o: Partial<InvoiceIssuer> = {}): InvoiceIssuer => {
  const { phone, website, ...rest } = therapeut();
  return { ...rest, ...o };
};

const invoicePatient = (o: Partial<InvoicePatient> = {}): InvoicePatient => {
  const { email, address, ...rest } = patient();
  return { ...rest, ...o };
};

const billableService = (o: Partial<BillableService> = {}): BillableService => {
  const { note, points, ...rest } = service();
  return { ...rest, ...o };
};

const invoice = (o: Partial<Invoice> = {}): Invoice => {
  const position = { serviceDate: "2024-01-10", service: billableService(), amount: 1, factor: "1.0" as const, price: 43.72 };
  return {
    id: nextId(),
    base64Pdf: "JVBERi0xLjEK",
    invoiceNumber: "202401101",
    invoiceAmount: 43.72,
    status: "pending",
    positions: [position],
    patient: invoicePatient(),
    ...o,
  };
};

const session = (o: Partial<Session> = {}): Session => {
  const { id, name, surname, birthdate } = patient();
  return {
    id: nextId(),
    therapeutId: null,
    sessionDate: "2024-01-10",
    sessionNumber: 1,
    durationMinutes: 50,
    sessionType: "Einzelgespräch",
    phase: null,
    moodStart: null,
    moodEnd: null,
    riskLevel: null,
    interventions: [],
    clinicalNotes: null,
    nextSessionPlan: null,
    status: "draft",
    deletedAt: null,
    createdAt: "2024-01-10T10:00:00.000Z",
    patient: { id, name, surname, birthdate, address },
    givenHomework: [],
    reviewHomework: [],
    pseudonymizedNotes: null,
    pseudonymizedNextPlan: null,
    pseudonymizationStatus: null,
    ...o,
  };
};

const treatmentPlan = (o: Partial<TreatmentPlan> = {}): TreatmentPlan => ({
  id: nextId(),
  patient: { id: nextId() },
  therapeutId: null,
  startDate: "2024-01-01",
  endDate: null,
  therapyForm: "Einzeltherapie",
  phase: "Diagnostik",
  approvedSessions: null,
  notes: null,
  createdAt: "2024-01-01T10:00:00.000Z",
  goals: [],
  ...o,
});

/** Response builders: `fake.patient({ name: "Jane" })`. */
export const fake = { patient, service, therapeut, issuer, invoicePatient, billableService, invoice, session, treatmentPlan };

/** A filter response (`{ rows, total }`). */
export const page = <T>(rows: T[]) => ({ rows, total: rows.length });
