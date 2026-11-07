import { getDb } from "./src/initialize";
import { clearDatabase } from "./tasks/dbUtils";

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  const db = getDb();
  await db.destroy();
});
