import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { Insertable, Selectable } from "kysely";
import { getDb } from "@/initialize";
import { Database } from "@/db";
import { patientFactory } from "./patients";

type TreatmentPlanRow = Database["treatment_plans"];
type TreatmentPlanBuild = Omit<Insertable<TreatmentPlanRow>, "id" | "createdAt" | "patientId"> & {
  patientId?: number;
};
type TreatmentPlanCreated = Selectable<TreatmentPlanRow>;

export const treatmentPlanFactory = Factory.define<
  TreatmentPlanBuild,
  unknown,
  TreatmentPlanCreated
>(() => ({
  therapeutId: null,
  startDate: faker.date.recent({ days: 90 }).toISOString().split("T")[0],
  endDate: null,
  therapyForm: "Einzeltherapie",
  phase: "Diagnostik",
  approvedSessions: null,
  notes: null,
})).onCreate(async (attrs) => {
  let { patientId } = attrs;
  if (patientId === undefined) {
    const patient = await patientFactory.create();
    patientId = patient.id;
  }
  const db = getDb();
  return db
    .insertInto("treatment_plans")
    .values({ ...attrs, patientId })
    .returningAll()
    .executeTakeFirstOrThrow();
});
