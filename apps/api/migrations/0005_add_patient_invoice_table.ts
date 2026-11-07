import { Kysely } from "kysely";
import { addIdColumn } from "./_helpers";

export async function up(kysely: Kysely<unknown>) {
  await addIdColumn(
    kysely,
    kysely.schema
      .createTable("patientInvoices")
      .addColumn("patientId", "integer", (col) =>
        col.references("patients.id").onDelete("cascade").notNull(),
      )
      .addColumn("invoiceId", "integer", (col) =>
        col.references("invoices.id").onDelete("cascade").notNull(),
      ),
  ).execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema.dropTable("patientInvoices").execute();
}
