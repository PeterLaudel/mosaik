import { Factory } from "fishery";
import { Insertable, Selectable } from "kysely";
import { getDb } from "@/initialize";
import { Database } from "@/db";
import { invoiceFactory } from "./invoices";
import { patientFactory } from "./patients";

type PatientInvoiceRow = Database["patientInvoices"];
type PatientInvoiceBuild = Omit<Insertable<PatientInvoiceRow>, "id" | "patientId" | "invoiceId"> & {
  patientId?: number;
  invoiceId?: number;
};
type PatientInvoiceCreated = Selectable<PatientInvoiceRow>;

export const patientInvoiceFactory = Factory.define<
  PatientInvoiceBuild,
  unknown,
  PatientInvoiceCreated
>(() => ({})).onCreate(async (attrs) => {
  let { patientId, invoiceId } = attrs;
  if (patientId === undefined) {
    const patient = await patientFactory.create();
    patientId = patient.id;
  }
  if (invoiceId === undefined) {
    const invoice = await invoiceFactory.create();
    invoiceId = invoice.id;
  }
  const db = getDb();
  return db
    .insertInto("patientInvoices")
    .values({ ...attrs, patientId, invoiceId })
    .returningAll()
    .executeTakeFirstOrThrow();
});
