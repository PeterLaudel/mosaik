import { faker } from "@faker-js/faker";
import { Factory } from "fishery";
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

// Builders for API responses, shaped by the contract types. They only create objects for stubs;
// nothing is stored anywhere.

const address = () => ({
  street: faker.location.streetAddress(),
  city: faker.location.city(),
  zip: faker.location.zipCode("#####"),
});

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export const patientFactory = Factory.define<Patient>(({ sequence }) => ({
  id: sequence,
  name: faker.person.firstName(),
  surname: faker.person.lastName(),
  email: faker.internet.email(),
  birthdate: isoDate(faker.date.birthdate()),
  address: address(),
  diagnosis: null,
  billingInfo: {
    name: faker.person.firstName(),
    surname: faker.person.lastName(),
    email: faker.internet.email(),
    address: address(),
  },
  invoicePassword: null,
}));

export const serviceFactory = Factory.define<Service>(({ sequence }) => ({
  id: sequence,
  short: `P${sequence}`,
  originalGopNr: String(800 + sequence),
  description: faker.lorem.words(3),
  points: 750,
  amounts: [
    { factor: "1.0", price: 43.72 },
    { factor: "2.3", price: 100.55 },
  ],
}));

export const therapeutFactory = Factory.define<Therapeut>(({ sequence }) => ({
  id: sequence,
  title: "Dr.",
  name: faker.person.firstName(),
  surname: faker.person.lastName(),
  street: faker.location.streetAddress(),
  zip: faker.location.zipCode("#####"),
  city: faker.location.city(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  taxId: faker.string.numeric(11),
  iban: "DE89370400440532013000",
  bic: "COBADEFFXXX",
  bankName: faker.company.name(),
  website: faker.internet.url(),
  enr: faker.string.numeric(9),
}));

/** The therapeut as the invoices feature sees them (no phone or website). */
export const issuerFactory = Factory.define<InvoiceIssuer>(() => {
  const { phone: _phone, website: _website, ...issuer } = therapeutFactory.build();
  return issuer;
});

export const invoicePatientFactory = Factory.define<InvoicePatient>(() => {
  const { email: _email, address: _address, ...patient } = patientFactory.build();
  return patient;
});

export const billableServiceFactory = Factory.define<BillableService>(() => {
  const { note: _note, points: _points, ...service } = serviceFactory.build();
  return service;
});

export const invoiceFactory = Factory.define<Invoice>(({ sequence }) => {
  const service = billableServiceFactory.build();
  return {
    id: sequence,
    base64Pdf: "JVBERi0xLjEK",
    invoiceNumber: `2024010${sequence}`,
    invoiceAmount: 43.72,
    status: "pending",
    positions: [
      { serviceDate: "2024-01-10", service, amount: 1, factor: "1.0", price: 43.72 },
    ],
    patient: invoicePatientFactory.build(),
  };
});

export const sessionFactory = Factory.define<Session>(({ sequence }) => {
  const patient = patientFactory.build();
  return {
    id: sequence,
    therapeutId: null,
    sessionDate: "2024-01-10",
    sessionNumber: sequence,
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
    patient: {
      id: patient.id,
      name: patient.name,
      surname: patient.surname,
      birthdate: patient.birthdate,
      address: patient.address,
    },
    givenHomework: [],
    reviewHomework: [],
    pseudonymizedNotes: null,
    pseudonymizedNextPlan: null,
    pseudonymizationStatus: null,
  };
});

export const treatmentPlanFactory = Factory.define<TreatmentPlan>(({ sequence }) => ({
  id: sequence,
  patient: { id: sequence },
  therapeutId: null,
  startDate: "2024-01-01",
  endDate: null,
  therapyForm: "Einzeltherapie",
  phase: "Diagnostik",
  approvedSessions: null,
  notes: null,
  createdAt: "2024-01-01T10:00:00.000Z",
  goals: [],
}));

/** A filter response (`{ rows, total }`) for a list of rows. */
export function page<T>(rows: T[]): { rows: T[]; total: number } {
  return { rows, total: rows.length };
}
