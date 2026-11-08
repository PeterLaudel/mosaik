import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { patientFactory } from "factories/patients";
import { treatmentPlanFactory } from "factories/treatmentPlans";
import { createFeatureApp } from "@/shared/testing/featureApp";
import { TreatmentPlansModule } from "./module";

describe("TreatmentPlansController", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createFeatureApp(TreatmentPlansModule);
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /patients/:patientId/treatment-plan returns the patient's plan", async () => {
    const plan = await treatmentPlanFactory.create();

    const response = await request(app.getHttpServer()).get(
      `/api/patients/${plan.patientId}/treatment-plan`,
    );

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(plan.id);
  });

  it("POST /patients/:patientId/treatment-plan creates a plan with goals", async () => {
    const patient = await patientFactory.create();
    const body = {
      startDate: "2024-01-15",
      endDate: null,
      therapyForm: "Einzeltherapie",
      phase: "Diagnostik",
      approvedSessions: 24,
      notes: null,
      goals: [{ description: "Schlaf verbessern", status: "active", priority: 1 }],
    };

    const response = await request(app.getHttpServer())
      .post(`/api/patients/${patient.id}/treatment-plan`)
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ ...body, patient: { id: patient.id } });
  });
});
