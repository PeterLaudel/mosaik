import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { patientFactory } from "factories/patients";
import { createFeatureApp } from "@/shared/testing/featureApp";
import { PatientsModule } from "./module";

describe("PatientsController", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createFeatureApp(PatientsModule);
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /patients filters patients by search", async () => {
    const patient = await patientFactory.create({ name: "Findme" });
    await patientFactory.create({ name: "Other" });

    const response = await request(app.getHttpServer()).get("/api/patients?search=Findme");

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.rows[0].id).toBe(patient.id);
  });

  it("GET /patients/:id returns the patient", async () => {
    const patient = await patientFactory.create();

    const response = await request(app.getHttpServer()).get(`/api/patients/${patient.id}`);

    expect(response.status).toBe(200);
    expect(response.body.surname).toBe(patient.surname);
  });

  it("GET /patients/:id answers 404 for an unknown patient", async () => {
    const response = await request(app.getHttpServer()).get("/api/patients/999999");

    expect(response.status).toBe(404);
  });

  it("POST /patients rejects an invalid body with 400", async () => {
    const response = await request(app.getHttpServer()).post("/api/patients").send({ name: "x" });

    expect(response.status).toBe(400);
  });
});
