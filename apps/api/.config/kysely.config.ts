import { defineConfig } from "kysely-ctl";
import { getDb } from "../src/initialize";

export default defineConfig({
  // kysely-ctl types kysely through its ESM build, this package through its CJS build:
  // same runtime object, but TypeScript sees two distinct classes
  kysely: getDb() as never,
});
