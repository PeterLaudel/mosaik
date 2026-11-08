import { defineConfig } from "tsup";

// The API runs as native ESM: NestJS 12 and oRPC 2 are ESM-only, and loading them through a
// CommonJS shim creates a second @nestjs/common instance (StreamableFile responses then get
// serialized as JSON). Bundling also resolves the "@/" path aliases; node_modules stay external.
export default defineConfig({
  entry: { main: "src/main.ts" },
  outDir: "dist/api",
  format: ["esm"],
  platform: "node",
  target: "node24",
  sourcemap: true,
  clean: true,
  tsconfig: "tsconfig.json",
  skipNodeModulesBundle: true,
});
