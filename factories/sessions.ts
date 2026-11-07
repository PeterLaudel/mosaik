import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { Insertable, Selectable } from "kysely";
import { getDb } from "@/initialize";
import { Database } from "@/db";
import { patientFactory } from "./patients";

type SessionRow = Database["sessions"];
type SessionBuild = Omit<Insertable<SessionRow>, "id" | "createdAt" | "patientId"> & {
  patientId?: number;
};
type SessionCreated = Selectable<SessionRow>;

export const sessionFactory = Factory.define<SessionBuild, unknown, SessionCreated>(({ sequence }) => ({
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
})).onCreate(async (attrs) => {
  let { patientId } = attrs;
  if (patientId === undefined) {
    const patient = await patientFactory.create();
    patientId = patient.id;
  }
  const db = getDb();
  return db
    .insertInto("sessions")
    .values({ ...attrs, patientId })
    .returningAll()
    .executeTakeFirstOrThrow();
});
