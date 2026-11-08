import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { therapeutFactory } from "factories/therapeuts";
import { createFeatureApp } from "@/shared/testing/featureApp";
import { TherapeutsModule } from "./module";

describe("TherapeutsController", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createFeatureApp(TherapeutsModule);
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /therapeuts lists therapeuts", async () => {
    const therapeut = await therapeutFactory.create();

    const response = await request(app.getHttpServer()).get("/api/therapeuts");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(therapeut.id);
  });

  it("PUT /therapeuts/:id updates the therapeut", async () => {
    const therapeut = await therapeutFactory.create();
    const body = { ...therapeut, city: "Leipzig" };

    const response = await request(app.getHttpServer())
      .put(`/api/therapeuts/${therapeut.id}`)
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body.city).toBe("Leipzig");
  });
});
