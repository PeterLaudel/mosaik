import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/e2e/"],
  // next/jest rewrites tsconfig paths in import statements only; jest.mock("@/...") needs this.
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
};

// NestJS 12 and oRPC 2 ship ESM only; Jest runs CommonJS, so these get transpiled too.
const esmOnlyPackages = [
  "@nestjs",
  "@orpc",
  "@standard-server",
  "@oxc-project",
  "@openapi-spec",
  "@faker-js",
  "jose",
];
const transformIgnorePatterns = [`/node_modules/(?!(${esmOnlyPackages.join("|")})/)`];

const loadNextJestConfig = createJestConfig(customJestConfig);

export default async function jestConfig() {
  const config = await loadNextJestConfig();
  return { ...config, transformIgnorePatterns };
}
