import { Database } from "@/initialize";
import { TreatmentPlan, TreatmentGoal, TherapyForm, TreatmentPhase, TreatmentPlanCreate, TreatmentPlanUpdate } from "./model";
import { jsonArrayFrom } from "@/database";


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

  // find() uses this.database, so create/update call it after the transaction commits to avoid
  // a SQLite single-connection deadlock (same pattern as InvoicesRepository.modelSelector(trx)).
  async create(plan: TreatmentPlanCreate): Promise<TreatmentPlan> {
    const id = await this.database.transaction().execute(async (trx) => {
      const { id: createdId } = await trx
        .insertInto("treatment_plans")
        .values(this.toRow(plan))
        .returning(["id"])
        .executeTakeFirstOrThrow();

      await this.replaceGoals(createdId, plan.goals, trx);
      return createdId;
    });

    return this.find(id);
  }

  async update(plan: TreatmentPlanUpdate): Promise<TreatmentPlan> {
    await this.database.transaction().execute(async (trx) => {
      await trx
        .updateTable("treatment_plans")
        .set(this.toRow(plan))
        .where("treatment_plans.id", "=", plan.id)
        .executeTakeFirstOrThrow();

      await this.replaceGoals(plan.id, plan.goals, trx);
    });

    return this.find(plan.id);
  }

  private toRow(plan: TreatmentPlanCreate) {
    return {
      patientId: plan.patient.id,
      therapeutId: plan.therapeutId,
      startDate: plan.startDate,
      endDate: plan.endDate,
      therapyForm: plan.therapyForm,
      phase: plan.phase,
      approvedSessions: plan.approvedSessions,
      notes: plan.notes,
    };
  }

  private async replaceGoals(planId: number, goals: TreatmentGoal[], trx: Database) {
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
    const { patientId, ...rest } = row;
    return {
      ...rest,
      patient: { id: patientId },
      therapyForm: row.therapyForm as TherapyForm,
      phase: row.phase as TreatmentPhase,
      goals: row.goals,
    };
  }
}
