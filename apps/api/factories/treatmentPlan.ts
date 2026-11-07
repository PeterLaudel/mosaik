import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { Insertable, Selectable } from "kysely";
import { getDb } from "../src/initialize";
import { TreatmentPlansTable, TreatmentGoalsTable } from "../src/db";
import { patientFactory } from "./patient";

type TreatmentPlanBuild = Omit<Insertable<TreatmentPlansTable>, "id" | "createdAt" | "patientId"> & {
  patientId?: number;
};
type TreatmentPlanCreated = Selectable<TreatmentPlansTable>;

export const treatmentPlanFactory = Factory.define<TreatmentPlanBuild, unknown, TreatmentPlanCreated>(
  () => ({
    therapeutId: null,
    startDate: faker.date.recent({ days: 90 }).toISOString().split("T")[0],
    endDate: null,
    therapyForm: "Einzeltherapie",
    phase: "Diagnostik",
    approvedSessions: null,
    notes: null,
  })
).onCreate(async (attrs) => {
  const patientId = attrs.patientId ?? (await patientFactory.create()).id;
  return await getDb()
    .insertInto("treatment_plans")
    .values({ ...attrs, patientId })
    .returningAll()
    .executeTakeFirstOrThrow();
});

// Inserts a raw goal row directly — used to seed DB state for read-path tests.
// Goal data fields only; treatmentPlanId is managed separately (factory concern, not model).
type TreatmentGoalBuild = Omit<Insertable<TreatmentGoalsTable>, "id" | "createdAt" | "treatmentPlanId"> & {
  treatmentPlanId?: number;
};
type TreatmentGoalCreated = Selectable<TreatmentGoalsTable>;

export const treatmentGoalFactory = Factory.define<TreatmentGoalBuild, unknown, TreatmentGoalCreated>(
  () => ({
    description: faker.lorem.sentence(),
    status: "active",
    priority: 2,
  })
).onCreate(async (attrs) => {
  const treatmentPlanId = attrs.treatmentPlanId ?? (await treatmentPlanFactory.create()).id;
  return await getDb()
    .insertInto("treatment_goals")
    .values({ ...attrs, treatmentPlanId })
    .returningAll()
    .executeTakeFirstOrThrow();
});
