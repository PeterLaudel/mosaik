import { Kysely, sql } from "kysely";
import { addIdColumn } from "./_helpers";

export async function up(kysely: Kysely<unknown>) {
  await addIdColumn(
    kysely,
    kysely.schema
      .createTable("invoices")
      .addColumn("invoiceNumber", "text", (col) => col.notNull())
      .addColumn("base64Pdf", "text", (col) => col.notNull())
      .addColumn("invoiceAmount", "real", (col) => col.notNull())
      .addColumn("createdAt", "text", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
      ),
  ).execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema.dropTable("invoices").execute();
}
