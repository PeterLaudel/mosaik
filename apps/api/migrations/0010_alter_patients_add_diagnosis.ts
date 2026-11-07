import { Kysely } from "kysely";

export async function up(kysely: Kysely<unknown>) {
  await kysely.schema
    .alterTable("patients")
    .addColumn("diagnosis", "text")
    .execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema.alterTable("patients").dropColumn("diagnosis").execute();
}
