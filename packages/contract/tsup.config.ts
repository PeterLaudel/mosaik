import path from "node:path";
import { defineConfig } from "tsup";

const repoRoot = path.resolve(__dirname, "../..");

// Bundles the backend's root contract (src/contract.ts) and the feature contract files it
// imports; everything else in the backend stays out because contract files import nothing else.
export default defineConfig({
  entry: { index: path.join(repoRoot, "src/contract.ts") },
  format: ["esm"],
  dts: { compilerOptions: { baseUrl: repoRoot, paths: { "@/*": ["src/*"] } } },
  clean: true,
  external: ["@orpc/contract", "@orpc/openapi", "zod"],
  tsconfig: path.join(repoRoot, "tsconfig.json"),
});
