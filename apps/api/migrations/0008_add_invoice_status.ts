import { Kysely, sql } from "kysely";

export async function up(kysely: Kysely<unknown>) {
  //statuses can be 'pending', 'sent', 'paid'
  await kysely.schema
    .alterTable("invoices")
    .addColumn("status", "text", (col) =>
      col
        .notNull()
        .defaultTo("pending")
        .check(sql`status IN ('pending', 'sent', 'paid')`)
    )
    .execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema.alterTable("invoices").dropColumn("status").execute();
}
