import { Kysely } from "kysely";
import { addIdColumn, isPostgres } from "./_helpers";

export async function up(kysely: Kysely<unknown>) {
  await addIdColumn(
    kysely,
    kysely.schema.createTable("sessions")
  )
    .addColumn("patientId", "integer", (col) => col.notNull().references("patients.id"))
    .addColumn("therapeutId", "integer", (col) => col.defaultTo(null))
    .addColumn("sessionDate", "text", (col) => col.notNull())
    .addColumn("sessionNumber", "integer", (col) => col.notNull())
    .addColumn("durationMinutes", "integer", (col) => col.notNull().defaultTo(50))
    .addColumn("sessionType", "text", (col) => col.notNull().defaultTo("Einzelgespräch"))
    .addColumn("phase", "text", (col) => col.defaultTo(null))
    .addColumn("moodStart", "integer", (col) => col.defaultTo(null))
    .addColumn("moodEnd", "integer", (col) => col.defaultTo(null))
    .addColumn("riskLevel", "text", (col) => col.defaultTo(null))
    .addColumn("interventions", "text", (col) => col.notNull().defaultTo("[]"))
    .addColumn("clinicalNotes", "text", (col) => col.defaultTo(null))
    .addColumn("nextSessionPlan", "text", (col) => col.defaultTo(null))
    .addColumn("status", "text", (col) => col.notNull().defaultTo("draft"))
    .addColumn("deletedAt", "text", (col) => col.defaultTo(null))
    .addColumn(
      "createdAt",
      "text",
      (col) => col.notNull().defaultTo(isPostgres(kysely) ? "now()" : "CURRENT_TIMESTAMP")
    )
    .execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema.dropTable("sessions").execute();
}
