import { Kysely } from "kysely";

export async function up(kysely: Kysely<unknown>) {
  await kysely.schema
    .alterTable("patients")
    .addColumn("invoicePassword", "text", (col) => col.defaultTo(null))
    .execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema
    .alterTable("patients")
    .dropColumn("invoicePassword")
    .execute();
}
