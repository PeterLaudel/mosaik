import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PatientsModule } from "@/features/patients";
import { createFeatureApp, sessionCookie, testUser } from "@/shared/testing/featureApp";
import { GoogleOAuth } from "./google";
import { decodeSession } from "./session";

const googleAccount = {
  email: "therapeut@example.com",
  name: "Dr. Therapeut",
  refreshToken: "google-refresh-token",
};

const fakeGoogle = {
  authorizationUrl: (state: string) => `https://accounts.google.test/auth?state=${state}`,
  exchangeCode: jest.fn(),
};

function cookieValue(setCookie: string[] | string | undefined, name: string): string | undefined {
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie ?? ""];
  const cookie = cookies.find((candidate) => candidate.startsWith(`${name}=`));
  return cookie?.split(";")[0].slice(name.length + 1);
}

describe("AuthController", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createFeatureApp(PatientsModule, (builder) =>
      builder.overrideProvider(GoogleOAuth).useValue(fakeGoogle),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    fakeGoogle.exchangeCode.mockReset();
    fakeGoogle.exchangeCode.mockResolvedValue(googleAccount);
  });

  async function startSignIn(returnTo = "/administration/invoices") {
    const response = await request(app.getHttpServer()).get(`/auth/google?returnTo=${returnTo}`);
    const location = new URL(response.headers.location);
    const state = location.searchParams.get("state") ?? "";
    const stateCookie = cookieValue(response.headers["set-cookie"], "mosaik_oauth");
    return { response, state, stateCookie };
  }

  describe("GET /auth/me", () => {
    it("returns the signed-in user without tokens", async () => {
      const cookie = await sessionCookie();

      const response = await request(app.getHttpServer()).get("/auth/me").set("Cookie", cookie);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ email: testUser.email, name: testUser.name });
    });

    it("answers 401 without a session", async () => {
      const response = await request(app.getHttpServer()).get("/auth/me");

      expect(response.status).toBe(401);
    });
  });

  describe("Google sign-in", () => {
    it("redirects to Google with a state that is also stored in a cookie", async () => {
      const { response, state, stateCookie } = await startSignIn();

      expect(response.status).toBe(302);
      expect(response.headers.location).toMatch(/^https:\/\/accounts\.google\.test\/auth/);
      expect(state).toMatch(/^[0-9a-f]{32}$/);
      expect(stateCookie).toBeDefined();
    });

    it("sets the session cookie and returns to the UI after the callback", async () => {
      const { state, stateCookie } = await startSignIn();

      const response = await request(app.getHttpServer())
        .get(`/auth/google/callback?code=auth-code&state=${state}`)
        .set("Cookie", `mosaik_oauth=${stateCookie}`);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("http://localhost:3000/administration/invoices");
      expect(fakeGoogle.exchangeCode).toHaveBeenCalledWith("auth-code");
      const session = cookieValue(response.headers["set-cookie"], "mosaik_session") ?? "";
      expect(await decodeSession(session)).toEqual({ ...googleAccount, provider: "google" });
    });

    it("rejects a callback whose state does not match the cookie", async () => {
      const { stateCookie } = await startSignIn();

      const response = await request(app.getHttpServer())
        .get("/auth/google/callback?code=auth-code&state=forged")
        .set("Cookie", `mosaik_oauth=${stateCookie}`);

      expect(response.status).toBe(400);
      expect(fakeGoogle.exchangeCode).not.toHaveBeenCalled();
    });

    it("rejects a callback without the state cookie", async () => {
      const { state } = await startSignIn();

      const response = await request(app.getHttpServer()).get(
        `/auth/google/callback?code=auth-code&state=${state}`,
      );

      expect(response.status).toBe(400);
    });

    it("never redirects off-site after sign-in", async () => {
      const { state, stateCookie } = await startSignIn("//evil.example.com");

      const response = await request(app.getHttpServer())
        .get(`/auth/google/callback?code=auth-code&state=${state}`)
        .set("Cookie", `mosaik_oauth=${stateCookie}`);

      expect(response.headers.location).toBe("http://localhost:3000/");
    });
  });

  it("POST /auth/logout clears the session cookie", async () => {
    const response = await request(app.getHttpServer()).post("/auth/logout");

    expect(response.status).toBe(204);
    expect(response.headers["set-cookie"]?.[0]).toMatch(/^mosaik_session=;/);
  });

  describe("when auth is required", () => {
    beforeAll(() => {
      process.env.AUTH_REQUIRED = "true";
    });

    afterAll(() => {
      delete process.env.AUTH_REQUIRED;
    });

    it("rejects API calls without a session", async () => {
      const response = await request(app.getHttpServer()).get("/patients");

      expect(response.status).toBe(401);
    });

    it("accepts API calls with a session", async () => {
      const cookie = await sessionCookie();

      const response = await request(app.getHttpServer()).get("/patients").set("Cookie", cookie);

      expect(response.status).toBe(200);
    });

    it("keeps the sign-in route open", async () => {
      const { response } = await startSignIn();

      expect(response.status).toBe(302);
    });
  });
});
