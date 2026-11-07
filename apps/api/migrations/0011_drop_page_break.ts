import { Kysely } from "kysely";

export async function up(kysely: Kysely<unknown>) {
  await kysely.schema.alterTable("invoicePositions").dropColumn("pageBreak").execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema
    .alterTable("invoicePositions")
    .addColumn("pageBreak", "integer", (col) => col.notNull().defaultTo("0"))
    .execute();
}
