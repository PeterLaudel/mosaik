import { dbMigrate } from "../src/database";

export { dbMigrate };

if (require.main === module) {
  dbMigrate().then(() => process.exit(0));
}
