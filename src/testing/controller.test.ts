import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { getDb } from "@/initialize";
import { createFeatureApp, testUser } from "@/shared/testing/featureApp";
import { TestingModule } from "./module";

describe("TestingController", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createFeatureApp(TestingModule);
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates rows through a table factory with the given attributes", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/testing/factories/patients")
      .send({ name: "Seeded" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ id: expect.any(Number), name: "Seeded" });
    const row = await getDb()
      .selectFrom("patients")
      .select("name")
      .where("id", "=", response.body.id)
      .executeTakeFirstOrThrow();
    expect(row.name).toBe("Seeded");
  });

  it("answers 404 for an unknown factory", async () => {
    const response = await request(app.getHttpServer()).post("/api/testing/factories/nope").send({});

    expect(response.status).toBe(404);
  });

  it("resets the database", async () => {
    await request(app.getHttpServer()).post("/api/testing/factories/patients").send({});

    const response = await request(app.getHttpServer()).post("/api/testing/reset");

    expect(response.status).toBe(204);
    const rows = await getDb().selectFrom("patients").select("id").execute();
    expect(rows).toHaveLength(0);
  });

  it("signs in a test user and returns a session cookie the API accepts", async () => {
    const signIn = await request(app.getHttpServer()).post("/api/testing/sign-in");
    const cookies = signIn.body.cookies as { name: string; value: string }[];
    const cookie = cookies.map(({ name, value }) => `${name}=${value}`).join("; ");

    const me = await request(app.getHttpServer()).get("/api/me").set("Cookie", cookie);

    expect(signIn.status).toBe(201);
    expect(me.body).toEqual(testUser);
  });

  describe("when auth is required", () => {
    beforeAll(() => {
      process.env.AUTH_REQUIRED = "true";
    });

    afterAll(() => {
      delete process.env.AUTH_REQUIRED;
    });

    it("stays reachable without a session", async () => {
      const response = await request(app.getHttpServer()).post("/api/testing/sign-in");

      expect(response.status).toBe(201);
    });
  });
});
