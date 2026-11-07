import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { Insertable, Selectable } from "kysely";
import { getDb } from "../src/initialize";
import { SessionsTable } from "../src/db";
import { patientFactory } from "./patient";

type SessionBuild = Omit<Insertable<SessionsTable>, "id" | "createdAt" | "patientId"> & {
  patientId?: number;
};
type SessionCreated = Selectable<SessionsTable>;

export const sessionFactory = Factory.define<SessionBuild, unknown, SessionCreated>(
  ({ sequence }) => ({
    therapeutId: null,
    sessionDate: faker.date.recent({ days: 60 }).toISOString().split("T")[0],
    sessionNumber: sequence,
    durationMinutes: 50,
    sessionType: "Einzelgespräch",
    phase: null,
    moodStart: null,
    moodEnd: null,
    riskLevel: null,
    interventions: "[]",
    clinicalNotes: null,
    nextSessionPlan: null,
    status: "draft",
    deletedAt: null,
    pseudonymizedNotes: null,
    pseudonymizedNextPlan: null,
    pseudonymizationStatus: null,
  })
).onCreate(async (attrs) => {
  const patientId = attrs.patientId ?? (await patientFactory.create()).id;
  return await getDb()
    .insertInto("sessions")
    .values({ ...attrs, patientId })
    .returningAll()
    .executeTakeFirstOrThrow();
});
