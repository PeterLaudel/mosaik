import { Kysely } from "kysely";
import { addIdColumn, isPostgres } from "./_helpers";

export async function up(kysely: Kysely<unknown>) {
  await addIdColumn(
    kysely,
    kysely.schema.createTable("treatment_plans")
  )
    .addColumn("patientId", "integer", (col) => col.notNull().references("patients.id"))
    .addColumn("therapeutId", "integer", (col) => col.defaultTo(null))
    .addColumn("startDate", "text", (col) => col.notNull())
    .addColumn("endDate", "text", (col) => col.defaultTo(null))
    .addColumn("therapyForm", "text", (col) => col.notNull().defaultTo("Einzeltherapie"))
    .addColumn("phase", "text", (col) => col.notNull().defaultTo("Diagnostik"))
    .addColumn("approvedSessions", "integer", (col) => col.defaultTo(null))
    .addColumn("notes", "text", (col) => col.defaultTo(null))
    .addColumn(
      "createdAt",
      "text",
      (col) => col.notNull().defaultTo(isPostgres(kysely) ? "now()" : "CURRENT_TIMESTAMP")
    )
    .execute();

  await addIdColumn(
    kysely,
    kysely.schema.createTable("treatment_goals")
  )
    .addColumn("treatmentPlanId", "integer", (col) => col.notNull().references("treatment_plans.id"))
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull().defaultTo("active"))
    .addColumn("priority", "integer", (col) => col.notNull().defaultTo(2))
    .addColumn(
      "createdAt",
      "text",
      (col) => col.notNull().defaultTo(isPostgres(kysely) ? "now()" : "CURRENT_TIMESTAMP")
    )
    .execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema.dropTable("treatment_goals").execute();
  await kysely.schema.dropTable("treatment_plans").execute();
}
