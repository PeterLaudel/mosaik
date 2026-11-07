import { postgresUrl } from "../environment";
import {
  Kysely,
  ParseJSONResultsPlugin,
  PostgresDialect,
  sql,
  Migrator,
} from "kysely";
import { Database } from "../db";
import { Pool } from "pg";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { migrationProvider } from "./migrationProvider";

export { jsonArrayFrom, jsonObjectFrom };

export function postgresDb() {
  const pool = new Pool({
    connectionString: postgresUrl(),
  });
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool,
    }),
    plugins: [new ParseJSONResultsPlugin()],
  });
}

export async function dbCreate() {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: dbUrl(),
      }),
    }),
  });
  await sql`CREATE DATABASE ${sql.raw(databaseName())}`.execute(db);
}

export async function dbDrop() {
  const db = new Kysely<PostgresDialect>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: dbUrl(),
      }),
    }),
  });

  const dbExists = await databaseExists(db);
  if (dbExists) {
    console.log("Dropping database");
    await sql`DROP DATABASE ${sql.raw(databaseName())}`.execute(db);
    console.log("Database dropped");
  } else {
    console.log("Database does not exist");
  }
}

export async function dbMigrate() {
  const migration = new Migrator({
    db: postgresDb(),
    provider: migrationProvider,
  });

  await migration.migrateToLatest().then(({ error, results }) => {
    results?.forEach((it) => {
      if (it.status === "Success") {
        console.log(
          `migration "${it.migrationName}" was executed successfully`,
        );
      } else if (it.status === "Error") {
        console.error(`failed to execute migration "${it.migrationName}"`);
      }
    });

    if (error) {
      console.error("failed to migrate");
      console.error(error);
      process.exit(1);
    }
  });
}

export function databaseName() {
  return postgresUrl().split("/").pop() || "";
}

export function dbUrl() {
  return postgresUrl().split("/").slice(0, -1).join("/");
}

export async function databaseExists(db: Kysely<PostgresDialect>) {
  const result =
    await sql`SELECT 1 FROM pg_database WHERE datname = ${databaseName()}`.execute(
      db,
    );
  return result.rows.length === 1;
}

export async function clearDatabase(
  db: Kysely<Database>,
  tables: (keyof Database)[],
) {
  for (const table of tables) {
    await sql`TRUNCATE TABLE ${sql.table(
      table,
    )} RESTART IDENTITY CASCADE`.execute(db);
  }
}
