import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { Insertable, Selectable } from "kysely";
import { getDb } from "@/initialize";
import { Database } from "@/db";

type InvoiceRow = Database["invoices"];
type InvoiceBuild = Omit<Insertable<InvoiceRow>, "id" | "createdAt">;
type InvoiceCreated = Selectable<InvoiceRow>;

// Inserts only the invoices row. Link it to a patient with patientInvoiceFactory and add
// positions with invoicePositionFactory.
export const invoiceFactory = Factory.define<InvoiceBuild, unknown, InvoiceCreated>(({ sequence }) => {
  const date = faker.date.birthdate().toISOString().split("T")[0];
  return {
    invoiceNumber: `${date.replace(/-/g, "")}${sequence}`,
    base64Pdf: "data:application/pdf;base64,example",
    invoiceAmount: faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
    status: "pending",
  };
}).onCreate(async (attrs) => {
  const db = getDb();
  return db.insertInto("invoices").values(attrs).returningAll().executeTakeFirstOrThrow();
});
