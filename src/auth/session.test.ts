import { testUser } from "@/shared/testing/featureApp";
import { decodeOAuthState, decodeSession, encodeOAuthState, encodeSession, safeReturnTo } from "./session";

describe("session cookie", () => {
  it("round-trips the user", async () => {
    const token = await encodeSession(testUser);

    expect(await decodeSession(token)).toEqual(testUser);
  });

  it("does not expose the refresh token in the cookie value", async () => {
    const token = await encodeSession(testUser);

    expect(token).not.toContain(testUser.refreshToken);
    expect(Buffer.from(token.split(".")[0], "base64url").toString()).toContain("A256GCM");
  });

  it("rejects a tampered token", async () => {
    const token = await encodeSession(testUser);
    const parts = token.split(".");
    parts[3] = parts[3].replace(/^./, (first) => (first === "A" ? "B" : "A"));

    expect(await decodeSession(parts.join("."))).toBeNull();
  });

  it("rejects garbage", async () => {
    expect(await decodeSession("not-a-token")).toBeNull();
  });

  it("does not accept an OAuth state token as a session", async () => {
    const token = await encodeOAuthState({ state: "abc", returnTo: "/" });

    expect(await decodeSession(token)).toBeNull();
    expect(await decodeOAuthState(token)).toEqual({ state: "abc", returnTo: "/" });
  });
});

describe("safeReturnTo", () => {
  it.each([
    ["/administration/invoices", "/administration/invoices"],
    ["//evil.example.com", "/"],
    ["/\\evil.example.com", "/"],
    ["https://evil.example.com", "/"],
    [undefined, "/"],
  ])("maps %p to %p", (input, expected) => {
    expect(safeReturnTo(input)).toBe(expected);
  });
});
