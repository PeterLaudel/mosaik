import { getDb } from "../initialize";
import { TreatmentPlansRepository } from "./treatmentPlansRepository";
import { treatmentPlanFactory, treatmentGoalFactory } from "../../factories/treatmentPlan";
import { patientFactory } from "../../factories/patient";

describe("TreatmentPlansRepository", () => {
  let repo: TreatmentPlansRepository;

  beforeEach(() => {
    repo = new TreatmentPlansRepository(getDb());
  });

  describe("#findByPatientId", () => {
    it("returns null when the patient has no treatment plan", async () => {
      const patient = await patientFactory.create();

      const result = await repo.findByPatientId(patient.id);

      expect(result).toBeNull();
    });

    it("returns the plan with the embedded patient and an empty goals array", async () => {
      const patient = await patientFactory.create();
      const plan = await treatmentPlanFactory.create({ patientId: patient.id });

      const result = await repo.findByPatientId(patient.id);

      expect(result).toMatchObject({
        id: plan.id,
        patient: expect.objectContaining({ id: patient.id }),
        therapyForm: plan.therapyForm,
        phase: plan.phase,
        goals: [],
      });
    });

    it("includes goals ordered by priority", async () => {
      const plan = await treatmentPlanFactory.create();
      const low = await treatmentGoalFactory.create({ treatmentPlanId: plan.id, priority: 3 });
      const high = await treatmentGoalFactory.create({ treatmentPlanId: plan.id, priority: 1 });
      const mid = await treatmentGoalFactory.create({ treatmentPlanId: plan.id, priority: 2 });

      const result = await repo.findByPatientId(plan.patientId);

      expect(result?.goals.map((g) => g.description)).toEqual([
        high.description,
        mid.description,
        low.description,
      ]);
    });

    it("does not include goals from another plan", async () => {
      const plan = await treatmentPlanFactory.create();
      const otherPlan = await treatmentPlanFactory.create();
      await treatmentGoalFactory.create({ treatmentPlanId: otherPlan.id });

      const result = await repo.findByPatientId(plan.patientId);

      expect(result?.goals).toEqual([]);
    });

    it("returns the most recent plan when a patient has multiple", async () => {
      const patient = await patientFactory.create();
      await treatmentPlanFactory.create({ patientId: patient.id });
      const newer = await treatmentPlanFactory.create({ patientId: patient.id });

      const result = await repo.findByPatientId(patient.id);

      expect(result?.id).toBe(newer.id);
    });
  });

  describe("#find", () => {
    it("returns the plan by id with the embedded patient and goals", async () => {
      const patient = await patientFactory.create();
      const plan = await treatmentPlanFactory.create({ patientId: patient.id });
      const goal = await treatmentGoalFactory.create({ treatmentPlanId: plan.id });

      const result = await repo.find(plan.id);

      expect(result).toMatchObject({
        id: plan.id,
        patient: expect.objectContaining({ id: patient.id }),
        goals: [expect.objectContaining({ description: goal.description })],
      });
    });

    it("throws when the plan does not exist", async () => {
      await expect(repo.find(999)).rejects.toThrow();
    });
  });

  describe("#save", () => {
    it("creates a new plan with goals in a single call", async () => {
      const patient = await patientFactory.create();

      const plan = await repo.save({
        patient,
        therapeutId: null,
        startDate: "2024-01-01",
        endDate: null,
        therapyForm: "Einzeltherapie",
        phase: "Diagnostik",
        approvedSessions: null,
        notes: null,
        goals: [
          { description: "Angststörung reduzieren", status: "active", priority: 1 },
        ],
      });

      expect(plan).toMatchObject({
        id: expect.any(Number),
        patient: expect.objectContaining({ id: patient.id }),
        therapyForm: "Einzeltherapie",
        goals: [expect.objectContaining({ description: "Angststörung reduzieren", status: "active", priority: 1 })],
      });
    });

    it("updates an existing plan and replaces goals atomically", async () => {
      const patient = await patientFactory.create();
      const existing = await repo.save({
        patient,
        therapeutId: null,
        startDate: "2024-01-01",
        endDate: null,
        therapyForm: "Einzeltherapie",
        phase: "Diagnostik",
        approvedSessions: null,
        notes: null,
        goals: [{ description: "Alter Fokus", status: "active", priority: 1 }],
      });

      const updated = await repo.save({
        id: existing.id,
        patient,
        therapeutId: null,
        startDate: "2024-01-01",
        endDate: null,
        therapyForm: "Gruppentherapie",
        phase: "Therapiephase",
        approvedSessions: 24,
        notes: "updated",
        goals: [{ description: "Neuer Fokus", status: "active", priority: 2 }],
      });

      expect(updated).toMatchObject({
        id: existing.id,
        therapyForm: "Gruppentherapie",
        phase: "Therapiephase",
        approvedSessions: 24,
        goals: [expect.objectContaining({ description: "Neuer Fokus" })],
      });

      const goalRows = await getDb()
        .selectFrom("treatment_goals")
        .select("description")
        .where("treatmentPlanId", "=", existing.id)
        .execute();
      expect(goalRows.map((r) => r.description)).toEqual(["Neuer Fokus"]);
    });

    it("saves a plan with no goals", async () => {
      const patient = await patientFactory.create();

      const plan = await repo.save({
        patient,
        therapeutId: null,
        startDate: "2024-01-01",
        endDate: null,
        therapyForm: "Einzeltherapie",
        phase: "Diagnostik",
        approvedSessions: null,
        notes: null,
        goals: [],
      });

      expect(plan.goals).toEqual([]);
    });

    it("clears all goals when saved with an empty array", async () => {
      const patient = await patientFactory.create();
      const existing = await repo.save({
        patient,
        therapeutId: null,
        startDate: "2024-01-01",
        endDate: null,
        therapyForm: "Einzeltherapie",
        phase: "Diagnostik",
        approvedSessions: null,
        notes: null,
        goals: [{ description: "Ziel", status: "active", priority: 1 }],
      });

      const cleared = await repo.save({ ...existing, goals: [] });

      expect(cleared.goals).toEqual([]);
      const rows = await getDb()
        .selectFrom("treatment_goals")
        .where("treatmentPlanId", "=", existing.id)
        .selectAll()
        .execute();
      expect(rows).toHaveLength(0);
    });
  });
});
