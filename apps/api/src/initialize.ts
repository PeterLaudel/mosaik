import { Kysely } from "kysely";
import { Database as DatabaseDescription } from "./db";
import { dbConnect } from "./database";

export type Database = Kysely<DatabaseDescription>;
let dbInstance: Database | null = null;

export function getDb(): Kysely<DatabaseDescription> {
  if (dbInstance) return dbInstance;

  dbInstance = dbConnect();
  return dbInstance;
}
