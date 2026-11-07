import { Kysely } from "kysely";
import { addIdColumn, isPostgres } from "./_helpers";

export async function up(kysely: Kysely<unknown>) {
  await addIdColumn(kysely, kysely.schema.createTable("homework"))
    .addColumn("sessionId", "integer", (col) => col.notNull().references("sessions.id"))
    .addColumn("type", "text", (col) => col.notNull()) // 'given' | 'review'
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.defaultTo(null)) // null for given, HomeworkStatus for review
    .addColumn(
      "createdAt",
      "text",
      (col) => col.notNull().defaultTo(isPostgres(kysely) ? "now()" : "CURRENT_TIMESTAMP")
    )
    .execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema.dropTable("homework").execute();
}
