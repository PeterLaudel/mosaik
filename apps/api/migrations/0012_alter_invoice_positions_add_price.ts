import { Kysely } from "kysely";

export async function up(kysely: Kysely<unknown>) {
  await kysely.schema
    .alterTable("invoicePositions")
    .addColumn("price", "real", (col) => col.notNull().defaultTo(0))
    .execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema
    .alterTable("invoicePositions")
    .dropColumn("price")
    .execute();
}
