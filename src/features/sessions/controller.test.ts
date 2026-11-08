import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { patientFactory } from "factories/patients";
import { sessionFactory } from "factories/sessions";
import { createFeatureApp } from "@/shared/testing/featureApp";
import { SessionsModule } from "./module";

describe("SessionsController", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createFeatureApp(SessionsModule);
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /sessions filters sessions by patient", async () => {
    const session = await sessionFactory.create();
    await sessionFactory.create();

    const response = await request(app.getHttpServer()).get(
      `/sessions?patientId=${session.patientId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.rows[0].id).toBe(session.id);
  });

  it("POST /patients/:patientId/sessions creates a draft session", async () => {
    const patient = await patientFactory.create();

    const response = await request(app.getHttpServer()).post(`/patients/${patient.id}/sessions`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "draft", patient: { id: patient.id } });
  });

  it("PATCH /sessions/:id updates only the given fields", async () => {
    const session = await sessionFactory.create({ clinicalNotes: "vorher" });

    const response = await request(app.getHttpServer())
      .patch(`/sessions/${session.id}`)
      .send({ clinicalNotes: "nachher" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ clinicalNotes: "nachher", sessionNumber: session.sessionNumber });
  });
});
