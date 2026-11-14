import type { Config } from "jest";

// NestJS 12 and oRPC 2 ship ESM only; Jest runs CommonJS, so these get transpiled too.
const esmOnlyPackages = [
  "@nestjs",
  "@orpc",
  "@standard-server",
  "@oxc-project",
  "@openapi-spec",
  "@faker-js",
  "jose",
  "better-auth",
  "@better-auth",
  "better-call",
  "@better-fetch",
  "nanostores",
  "defu",
  "@noble",
  "rou3",
  "uncrypto",
];

// SWC compiles TypeScript (with Nest's legacy decorators) and the ESM packages above to CommonJS
const swc = [
  "@swc/jest",
  {
    jsc: {
      parser: { syntax: "typescript", decorators: true },
      transform: { legacyDecorator: true },
      target: "es2022",
    },
    module: { type: "commonjs" },
  },
];

const config: Config = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^factories/(.*)$": "<rootDir>/factories/$1",
    "^tasks/(.*)$": "<rootDir>/tasks/$1",
  },
  transform: { "^.+\\.(t|j|mj|cj)sx?$": swc as [string, Record<string, unknown>] },
  transformIgnorePatterns: [`/node_modules/(?!(${esmOnlyPackages.join("|")})/)`],
};

export default config;
