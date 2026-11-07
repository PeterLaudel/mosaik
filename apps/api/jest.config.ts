import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  transform: {
    "^.+\\.(t|j|mj)s$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", decorators: true },
          transform: { legacyDecorator: true, decoratorMetadata: true },
          target: "es2022",
        },
        module: { type: "commonjs" },
      },
    ],
  },
  // faker and NestJS 12 ship ESM in .js files, oRPC and its deps as .mjs: let swc turn them into CommonJS for Jest
  transformIgnorePatterns: ["/node_modules/(?!(@faker-js|@nestjs|uid|load-esm|file-type)/)(?!.*\\.mjs$)"],
  moduleFileExtensions: ["ts", "js", "mjs", "json"],
};

export default config;
