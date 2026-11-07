import { Database } from "../initialize";
import { TreatmentPlan, TreatmentGoal, TherapyForm, TreatmentPhase } from "@mosaik/contract/models/treatmentPlan";
import { jsonArrayFrom, jsonObjectFrom } from "../database";
import { patientSelector } from "./selectors/patient";

export type TreatmentPlanSave = Omit<TreatmentPlan, "id" | "createdAt"> & { id?: number };

export class TreatmentPlansRepository {
  constructor(private readonly database: Database) {}

  async findByPatientId(patientId: number): Promise<TreatmentPlan | null> {
    const row = await this.planSelector()
      .where("treatment_plans.patientId", "=", patientId)
      .orderBy("treatment_plans.createdAt", "desc")
      .orderBy("treatment_plans.id", "desc")
      .limit(1)
      .executeTakeFirst();

    return row ? this.toModel(row) : null;
  }

  async find(id: number): Promise<TreatmentPlan> {
    const row = await this.planSelector()
      .where("treatment_plans.id", "=", id)
      .executeTakeFirstOrThrow();

    return this.toModel(row);
  }

  async save(plan: TreatmentPlanSave): Promise<TreatmentPlan> {
    // find() uses this.database; must be called after the transaction commits to avoid
    // SQLite single-connection deadlock (same pattern as InvoicesRepository.modelSelector(trx))
    const id = await this.database.transaction().execute(async (trx) => {
      const { id: savedId } = plan.id
        ? await trx
            .updateTable("treatment_plans")
            .set({
              patientId: plan.patient.id,
              therapeutId: plan.therapeutId,
              startDate: plan.startDate,
              endDate: plan.endDate,
              therapyForm: plan.therapyForm,
              phase: plan.phase,
              approvedSessions: plan.approvedSessions,
              notes: plan.notes,
            })
            .returning(["id"])
            .where("treatment_plans.id", "=", plan.id)
            .executeTakeFirstOrThrow()
        : await trx
            .insertInto("treatment_plans")
            .values({
              patientId: plan.patient.id,
              therapeutId: plan.therapeutId,
              startDate: plan.startDate,
              endDate: plan.endDate,
              therapyForm: plan.therapyForm,
              phase: plan.phase,
              approvedSessions: plan.approvedSessions,
              notes: plan.notes,
            })
            .returning(["id"])
            .executeTakeFirstOrThrow();

      await this.upsertGoals(savedId, plan.goals, trx);
      return savedId;
    });

    return this.find(id);
  }

  private async upsertGoals(planId: number, goals: TreatmentGoal[], trx: Database) {
    await trx
      .deleteFrom("treatment_goals")
      .where("treatment_goals.treatmentPlanId", "=", planId)
      .execute();

    if (goals.length === 0) return;

    await trx
      .insertInto("treatment_goals")
      .values(goals.map((g) => ({ ...g, treatmentPlanId: planId })))
      .execute();
  }

  private planSelector() {
    return this.database
      .selectFrom("treatment_plans")
      .select([
        "treatment_plans.id",
        "treatment_plans.patientId",
        "treatment_plans.therapeutId",
        "treatment_plans.startDate",
        "treatment_plans.endDate",
        "treatment_plans.therapyForm",
        "treatment_plans.phase",
        "treatment_plans.approvedSessions",
        "treatment_plans.notes",
        "treatment_plans.createdAt",
      ])
      .select(({ ref }) => [
        jsonObjectFrom(
          patientSelector(this.database).whereRef("patients.id", "=", ref("treatment_plans.patientId"))
        )
          .$notNull()
          .as("patient"),
        jsonArrayFrom(
          this.database
            .selectFrom("treatment_goals")
            .select(["description", "status", "priority"])
            .whereRef("treatment_goals.treatmentPlanId", "=", ref("treatment_plans.id"))
            .orderBy("treatment_goals.priority", "asc")
        ).as("goals"),
      ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toModel(row: any): TreatmentPlan {
    return {
      ...row,
      therapyForm: row.therapyForm as TherapyForm,
      phase: row.phase as TreatmentPhase,
      goals: row.goals,
    };
  }
}
