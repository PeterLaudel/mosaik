import { Kysely } from "kysely";
import { addIdColumn } from "./_helpers";

export async function up(kysely: Kysely<unknown>) {
  await addIdColumn(
    kysely,
    kysely.schema
      .createTable("services")
      .addColumn("short", "text", (col) => col.notNull())
      .addColumn("originalGopNr", "text", (col) => col.notNull())
      .addColumn("description", "text", (col) => col.notNull())
      .addColumn("note", "text", (col) => col.defaultTo(null))
      .addColumn("points", "integer", (col) => col.notNull()),
  ).execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema.dropTable("services").execute();
}
