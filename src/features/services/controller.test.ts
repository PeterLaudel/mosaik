import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { serviceAmountFactory } from "factories/serviceAmounts";
import { createFeatureApp } from "@/shared/testing/featureApp";
import { ServicesModule } from "./module";

describe("ServicesController", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createFeatureApp(ServicesModule);
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /services/:id returns the service with its amounts", async () => {
    const amount = await serviceAmountFactory.create({ factor: "2.3" });

    const response = await request(app.getHttpServer()).get(`/services/${amount.serviceId}`);

    expect(response.status).toBe(200);
    expect(response.body.amounts).toEqual([{ factor: "2.3", price: amount.price }]);
  });

  it("POST /services creates a service", async () => {
    const body = {
      short: "P1",
      originalGopNr: "870",
      description: "Einzelbehandlung",
      points: 750,
      amounts: [{ factor: "1.0", price: 43.72 }],
    };

    const response = await request(app.getHttpServer()).post("/services").send(body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(body);
  });
});
