import { Kysely, sql } from "kysely";

export async function up(kysely: Kysely<unknown>) {
  //statuses can be 'pending', 'sent', 'paid'
  await kysely.schema
    .createTable("invoicePositions")
    .addColumn("invoiceId", "integer", (col) =>
      col.references("invoices.id").notNull()
    )
    .addColumn("serviceDate", "text", (col) => col.notNull())
    .addColumn("serviceId", "integer", (col) =>
      col.references("services.id").notNull()
    )
    .addColumn("pageBreak", "integer", (col) => col.notNull().defaultTo("0"))
    .addColumn("amount", "integer", (col) => col.notNull())
    .addColumn("factor", "text", (col) =>
      col.notNull().check(sql`factor in ('1.0', '1.8', '2.3')`)
    )
    .execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema.dropTable("invoicePositions").execute();
}
