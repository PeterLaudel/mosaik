import { Kysely } from "kysely";
import { addIdColumn, isPostgres } from "./_helpers";

export async function up(kysely: Kysely<unknown>) {
  await addIdColumn(kysely, kysely.schema.createTable("outbox"))
    .addColumn("eventType", "text", (col) => col.notNull())
    .addColumn("payload", "text", (col) => col.notNull())
    .addColumn("processedAt", "text", (col) => col.defaultTo(null))
    .addColumn(
      "createdAt",
      "text",
      (col) => col.notNull().defaultTo(isPostgres(kysely) ? "now()" : "CURRENT_TIMESTAMP")
    )
    .execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema.dropTable("outbox").execute();
}
