import { databaseDialect } from "../environment";
import {
  sqliteDb,
  dbCreate as sqliteDbCreate,
  dbDrop as sqliteDbDrop,
  dbMigrate as sqliteDbMigrate,
  jsonArrayFrom as sqliteJsonArrayFrom,
  jsonObjectFrom as sqliteJsonObjectFrom,
  clearDatabase as clearSqliteDatabase,
} from "./sqlite";
import {
  postgresDb,
  dbCreate as postgresDbCreate,
  dbDrop as postgresDbDrop,
  dbMigrate as postgresDbMigrate,
  jsonArrayFrom as postgresJsonArrayFrom,
  jsonObjectFrom as postgresJsonObjectFrom,
  clearDatabase as clearPostgresDatabase,
} from "./postgres";
import { Database } from "../db";
import { Kysely } from "kysely";

export function dbConnect() {
  if (databaseDialect() === "sqlite") {
    return sqliteDb();
  } else if (databaseDialect() === "postgres") {
    return postgresDb();
  } else {
    throw new Error("Unsupported database dialect");
  }
}

export async function dbCreate() {
  if (databaseDialect() === "sqlite") {
    return sqliteDbCreate();
  } else if (databaseDialect() === "postgres") {
    return await postgresDbCreate();
  } else {
    throw new Error("Unsupported database dialect");
  }
}

export async function dbDrop() {
  if (databaseDialect() === "sqlite") {
    return sqliteDbDrop();
  } else if (databaseDialect() === "postgres") {
    return await postgresDbDrop();
  } else {
    throw new Error("Unsupported database dialect");
  }
}

export async function dbMigrate() {
  if (databaseDialect() === "sqlite") {
    return await sqliteDbMigrate();
  } else if (databaseDialect() === "postgres") {
    return await postgresDbMigrate();
  } else {
    throw new Error("Unsupported database dialect");
  }
}

type DatabaseRecord = Record<keyof Database, undefined>;

export async function clearDatabase(db: Kysely<Database>) {
  const allRecords: DatabaseRecord = {
    outbox: undefined,
    homework: undefined,          // FK → sessions, patients
    treatment_goals: undefined,  // FK → treatment_plans
    treatment_plans: undefined,  // FK → patients
    sessions: undefined,         // FK → patients
    invoicePositions: undefined,
    patientInvoices: undefined,
    invoices: undefined,
    serviceAmounts: undefined,
    services: undefined,
    patients: undefined,
    therapeuts: undefined,
  };

  const tables: (keyof DatabaseRecord)[] = Object.keys(
    allRecords,
  ) as (keyof DatabaseRecord)[];
  if (databaseDialect() === "sqlite") {
    await clearSqliteDatabase(db, tables);
  } else if (databaseDialect() === "postgres") {
    await clearPostgresDatabase(db, tables);
  }
}

export const jsonArrayFrom =
  databaseDialect() === "sqlite" ? sqliteJsonArrayFrom : postgresJsonArrayFrom;

export const jsonObjectFrom =
  databaseDialect() === "sqlite"
    ? sqliteJsonObjectFrom
    : postgresJsonObjectFrom;
