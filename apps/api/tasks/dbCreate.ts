import { dbCreate } from "../src/database";

export { dbCreate };

if (require.main === module) {
  dbCreate().then(() => process.exit(0));
}
