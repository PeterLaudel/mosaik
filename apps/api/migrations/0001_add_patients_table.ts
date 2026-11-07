import { Kysely, sql } from "kysely";
import { addIdColumn } from "./_helpers";

export async function up(kysely: Kysely<unknown>): Promise<void> {
  await addIdColumn(
    kysely,
    kysely.schema
      .createTable("patients")
      .addColumn("name", "text", (col) => col.notNull())
      .addColumn("surname", "text", (col) => col.notNull())
      .addColumn("email", "text", (col) => col.notNull())
      .addColumn("birthdate", "text", (col) => col.notNull())
      .addColumn("street", "text", (col) => col.notNull())
      .addColumn("city", "text", (col) => col.notNull())
      .addColumn("zip", "text", (col) => col.notNull())
      .addColumn("billingName", "text", (col) => col.notNull())
      .addColumn("billingSurname", "text", (col) => col.notNull())
      .addColumn("billingEmail", "text", (col) => col.notNull())
      .addColumn("billingStreet", "text", (col) => col.notNull())
      .addColumn("billingCity", "text", (col) => col.notNull())
      .addColumn("billingZip", "text", (col) => col.notNull())
      .addColumn("createdAt", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
      ),
  ).execute();
}

export async function down(kysely: Kysely<unknown>): Promise<void> {
  await kysely.schema.dropTable("patients").execute();
}
