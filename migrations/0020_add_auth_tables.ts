import { Kysely } from "kysely";
import { isPostgres } from "./_helpers";

// Tables for better-auth (src/auth/auth.ts), matching what its migration generator emits.
// They are prefixed "auth_" so they don't read like the clinical "sessions" table.
export async function up(kysely: Kysely<unknown>) {
  const date = isPostgres(kysely) ? "timestamptz" : "date";
  const boolean = isPostgres(kysely) ? "boolean" : "integer";

  await kysely.schema
    .createTable("auth_users")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("email", "text", (col) => col.notNull().unique())
    .addColumn("emailVerified", boolean, (col) => col.notNull())
    .addColumn("image", "text")
    .addColumn("createdAt", date, (col) => col.notNull())
    .addColumn("updatedAt", date, (col) => col.notNull())
    .execute();

  await kysely.schema
    .createTable("auth_sessions")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("expiresAt", date, (col) => col.notNull())
    .addColumn("token", "text", (col) => col.notNull().unique())
    .addColumn("createdAt", date, (col) => col.notNull())
    .addColumn("updatedAt", date, (col) => col.notNull())
    .addColumn("ipAddress", "text")
    .addColumn("userAgent", "text")
    .addColumn("userId", "text", (col) =>
      col.notNull().references("auth_users.id").onDelete("cascade"),
    )
    .execute();

  await kysely.schema
    .createTable("auth_accounts")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("accountId", "text", (col) => col.notNull())
    .addColumn("providerId", "text", (col) => col.notNull())
    .addColumn("userId", "text", (col) =>
      col.notNull().references("auth_users.id").onDelete("cascade"),
    )
    .addColumn("accessToken", "text")
    .addColumn("refreshToken", "text")
    .addColumn("idToken", "text")
    .addColumn("accessTokenExpiresAt", date)
    .addColumn("refreshTokenExpiresAt", date)
    .addColumn("scope", "text")
    .addColumn("password", "text")
    .addColumn("createdAt", date, (col) => col.notNull())
    .addColumn("updatedAt", date, (col) => col.notNull())
    .execute();

  await kysely.schema
    .createTable("auth_verifications")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("identifier", "text", (col) => col.notNull())
    .addColumn("value", "text", (col) => col.notNull())
    .addColumn("expiresAt", date, (col) => col.notNull())
    .addColumn("createdAt", date, (col) => col.notNull())
    .addColumn("updatedAt", date, (col) => col.notNull())
    .execute();

  await kysely.schema
    .createIndex("auth_sessions_userId_idx")
    .on("auth_sessions")
    .column("userId")
    .execute();
  await kysely.schema
    .createIndex("auth_accounts_userId_idx")
    .on("auth_accounts")
    .column("userId")
    .execute();
  await kysely.schema
    .createIndex("auth_verifications_identifier_idx")
    .on("auth_verifications")
    .column("identifier")
    .execute();
}

export async function down(kysely: Kysely<unknown>) {
  await kysely.schema.dropTable("auth_verifications").execute();
  await kysely.schema.dropTable("auth_accounts").execute();
  await kysely.schema.dropTable("auth_sessions").execute();
  await kysely.schema.dropTable("auth_users").execute();
}
