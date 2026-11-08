import { OAuth2Client } from "google-auth-library";
import { apiPublicUrl, googleClientId, googleClientSecret } from "@/environment";

// Same scopes as the previous next-auth setup: mail.google.com lets invoices go out via Gmail.
const SCOPES = ["openid", "profile", "email", "https://mail.google.com/"];

export interface GoogleAccount {
  email: string;
  name: string;
  refreshToken: string;
}

/** The Google side of the OAuth flow; a class so tests can swap it out. */
export class GoogleOAuth {
  private readonly client: OAuth2Client;

  constructor() {
    const redirectUri = `${apiPublicUrl()}/auth/google/callback`;
    this.client = new OAuth2Client(googleClientId(), googleClientSecret(), redirectUri);
  }

  authorizationUrl(state: string): string {
    // prompt=consent makes Google return a refresh token on every sign-in
    return this.client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES,
      state,
    });
  }

  async exchangeCode(code: string): Promise<GoogleAccount> {
    const { tokens } = await this.client.getToken(code);
    if (!tokens.id_token || !tokens.refresh_token) {
      throw new Error("Google did not return an id token and refresh token");
    }

    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token,
      audience: googleClientId(),
    });
    const payload = ticket.getPayload();
    if (!payload?.email) throw new Error("Google account has no email");

    return {
      email: payload.email,
      name: payload.name ?? "",
      refreshToken: tokens.refresh_token,
    };
  }
}
