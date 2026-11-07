import { Kysely } from "kysely";

export async function up(kysely: Kysely<unknown>) {
  // SQLite only allows a single column per ALTER TABLE ADD COLUMN statement
  await kysely.schema
    .alterTable("sessions")
    .addColumn("pseudonymizedNotes", "text", (col) => col.defaultTo(null))
    .execute();
  await kysely.schema
    .alterTable("sessions")
    .addColumn("pseudonymizedNextPlan", "text", (col) => col.defaultTo(null))
    .execute();
  await kysely.schema
    .alterTable("sessions")
    .addColumn("pseudonymizationStatus", "text", (col) => col.defaultTo(null))
    .execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema.alterTable("sessions").dropColumn("pseudonymizedNotes").execute();
  await kysely.schema.alterTable("sessions").dropColumn("pseudonymizedNextPlan").execute();
  await kysely.schema.alterTable("sessions").dropColumn("pseudonymizationStatus").execute();
}
