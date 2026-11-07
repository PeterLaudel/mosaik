import { type Database } from "../../initialize";
import { jsonObjectFrom, jsonArrayFrom } from "../../database";
import { patientSelector } from "./patient";

export function sessionSelector(database: Database) {
  return database
    .selectFrom("sessions")
    .select([
      "sessions.id",
      "sessions.patientId",
      "sessions.therapeutId",
      "sessions.sessionDate",
      "sessions.sessionNumber",
      "sessions.durationMinutes",
      "sessions.sessionType",
      "sessions.phase",
      "sessions.moodStart",
      "sessions.moodEnd",
      "sessions.riskLevel",
      "sessions.interventions",
      "sessions.clinicalNotes",
      "sessions.nextSessionPlan",
      "sessions.status",
      "sessions.deletedAt",
      "sessions.createdAt",
      "sessions.pseudonymizedNotes",
      "sessions.pseudonymizedNextPlan",
      "sessions.pseudonymizationStatus",
    ])
    .select(({ ref }) => [
      jsonObjectFrom(
        patientSelector(database).whereRef("patients.id", "=", ref("sessions.patientId"))
      )
        .$notNull()
        .as("patient"),
      jsonArrayFrom(
        database
          .selectFrom("homework")
          .select(["homework.description"])
          .whereRef("homework.sessionId", "=", ref("sessions.id"))
          .where("homework.type", "=", "given")
          .orderBy("homework.createdAt", "asc")
      ).as("givenHomework"),
      jsonArrayFrom(
        database
          .selectFrom("homework")
          .select(["homework.description", "homework.status"])
          .whereRef("homework.sessionId", "=", ref("sessions.id"))
          .where("homework.type", "=", "review")
          .orderBy("homework.createdAt", "asc")
      ).as("reviewHomework"),
    ]);
}
