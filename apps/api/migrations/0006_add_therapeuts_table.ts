import { Kysely } from "kysely";
import { addIdColumn } from "./_helpers";

export async function up(kysely: Kysely<unknown>) {
  await addIdColumn(
    kysely,
    kysely.schema
      .createTable("therapeuts")
      .addColumn("title", "text", (col) => col.notNull())
      .addColumn("name", "text", (col) => col.notNull())
      .addColumn("surname", "text", (col) => col.notNull())
      .addColumn("street", "text", (col) => col.notNull())
      .addColumn("zip", "text", (col) => col.notNull())
      .addColumn("city", "text", (col) => col.notNull())
      .addColumn("email", "text", (col) => col.notNull())
      .addColumn("phone", "text", (col) => col.notNull())
      .addColumn("taxId", "text", (col) => col.notNull())
      .addColumn("bankName", "text", (col) => col.notNull())
      .addColumn("iban", "text", (col) => col.notNull())
      .addColumn("bic", "text", (col) => col.notNull())
      .addColumn("website", "text", (col) => col.notNull())
      .addColumn("enr", "text", (col) => col.notNull()),
  ).execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema.dropTable("therapeuts").execute();
}
