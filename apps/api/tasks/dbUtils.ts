import { clearDatabase as clearDatabaseOrigin } from "../src/database";
import { getDb } from "../src/initialize";

export async function clearDatabase() {
  const db = getDb();
  await clearDatabaseOrigin(db);
}
