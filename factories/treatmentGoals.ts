import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { Insertable, Selectable } from "kysely";
import { getDb } from "@/initialize";
import { Database } from "@/db";
import { treatmentPlanFactory } from "./treatmentPlans";

type TreatmentGoalRow = Database["treatment_goals"];
type TreatmentGoalBuild = Omit<Insertable<TreatmentGoalRow>, "id" | "createdAt" | "treatmentPlanId"> & {
  treatmentPlanId?: number;
};
type TreatmentGoalCreated = Selectable<TreatmentGoalRow>;

export const treatmentGoalFactory = Factory.define<
  TreatmentGoalBuild,
  unknown,
  TreatmentGoalCreated
>(() => ({
  description: faker.lorem.sentence(),
  status: "active",
  priority: 2,
})).onCreate(async (attrs) => {
  let { treatmentPlanId } = attrs;
  if (treatmentPlanId === undefined) {
    const plan = await treatmentPlanFactory.create();
    treatmentPlanId = plan.id;
  }
  const db = getDb();
  return db
    .insertInto("treatment_goals")
    .values({ ...attrs, treatmentPlanId })
    .returningAll()
    .executeTakeFirstOrThrow();
});
