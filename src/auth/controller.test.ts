import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PatientsModule } from "@/features/patients";
import { createFeatureApp, signIn, testUser } from "@/shared/testing/featureApp";

describe("auth", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createFeatureApp(PatientsModule);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /me", () => {
    it("returns the signed-in user", async () => {
      const { cookie } = await signIn();

      const response = await request(app.getHttpServer()).get("/api/me").set("Cookie", cookie);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(testUser);
    });

    it("answers 401 without a session", async () => {
      const response = await request(app.getHttpServer()).get("/api/me");

      expect(response.status).toBe(401);
    });

    it("answers 401 for a forged session cookie", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/me")
        .set("Cookie", "better-auth.session_token=forged.token");

      expect(response.status).toBe(401);
    });
  });

  describe("better-auth routes", () => {
    it("serves the session under /api/auth", async () => {
      const { cookie } = await signIn();

      const response = await request(app.getHttpServer())
        .get("/api/auth/get-session")
        .set("Cookie", cookie);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe(testUser.email);
    });

    it("starts Google sign-in with a redirect back to the UI", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/auth/sign-in/social")
        .set("Origin", "http://localhost:3000")
        .send({ provider: "google", callbackURL: "http://localhost:3000/administration" });

      expect(response.status).toBe(200);
      const authorizationUrl = new URL(response.body.url);
      expect(authorizationUrl.host).toBe("accounts.google.com");
      expect(authorizationUrl.searchParams.get("access_type")).toBe("offline");
      expect(authorizationUrl.searchParams.get("scope")).toContain("https://mail.google.com/");
      expect(authorizationUrl.searchParams.get("redirect_uri")).toBe(
        "http://localhost:4000/api/auth/callback/google",
      );
    });

    it("refuses to redirect to an untrusted origin after sign-in", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/auth/sign-in/social")
        .set("Origin", "http://localhost:3000")
        .send({ provider: "google", callbackURL: "https://evil.example.com" });

      expect(response.status).toBe(403);
    });

    it("revokes the session on sign-out", async () => {
      const { cookie } = await signIn();

      const signOut = await request(app.getHttpServer())
        .post("/api/auth/sign-out")
        .set("Origin", "http://localhost:3000")
        .set("Cookie", cookie);
      const me = await request(app.getHttpServer()).get("/api/me").set("Cookie", cookie);

      expect(signOut.status).toBe(200);
      expect(me.status).toBe(401);
    });
  });

  describe("when auth is required", () => {
    beforeAll(() => {
      process.env.AUTH_REQUIRED = "true";
    });

    afterAll(() => {
      delete process.env.AUTH_REQUIRED;
    });

    it("rejects API calls without a session", async () => {
      const response = await request(app.getHttpServer()).get("/api/patients");

      expect(response.status).toBe(401);
    });

    it("accepts API calls with a session", async () => {
      const { cookie } = await signIn();

      const response = await request(app.getHttpServer()).get("/api/patients").set("Cookie", cookie);

      expect(response.status).toBe(200);
    });

    it("keeps better-auth's sign-in route open", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/auth/sign-in/social")
        .set("Origin", "http://localhost:3000")
        .send({ provider: "google", callbackURL: "http://localhost:3000/" });

      expect(response.status).toBe(200);
    });
  });
});
