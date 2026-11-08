const { defineConfig, globalIgnores } = require("eslint/config");
const js = require("@eslint/js");
const globals = require("globals");
const tseslint = require("typescript-eslint");
const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const fs = require("fs");
const path = require("path");

// Features share data (the database), not code: a feature may not import another feature.
// The app layer (pages, actions, routes) is where features are composed.
const features = fs
    .readdirSync(path.join(__dirname, "src/features"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

const featureBoundaries = features.map((feature) => {
    const others = features.filter((other) => other !== feature).join("|");
    return {
        files: [`src/features/${feature}/**/*.{ts,tsx}`],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: [{
                    regex: `^(@/features/|(\\.\\./)+)(${others})(/|$)`,
                    message: "Features must not import other features. Read the data you need through this feature's own repository instead.",
                }],
            }],
        },
    };
});

module.exports = defineConfig([
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            ecmaVersion: 2023,
        },
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        rules: {
            "no-console": ["warn", { allow: ["warn", "error"] }],
            eqeqeq: ["error", "always", { null: "ignore" }],
            "no-param-reassign": ["error", { props: true }],
        },
    },
    ...nextCoreWebVitals,
    globalIgnores(["**/*.d.ts", "playwright-report/**", ".next/**", "**/*.js", "dist/**", "packages/*/dist/**"]),
    ...featureBoundaries,
    {
        files: ["src/app/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: [{
                    regex: "^@/features/[a-z-]+/(repository|selectors?)$",
                    message: "The app layer talks to a feature through its service (get*Service from @/features/<feature>/legacy until the UI moves to the oRPC client), not its repository.",
                }],
            }],
        },
    },
    {
        // Backend composition (app module, worker, contract): a feature is reached only through
        // its protocol layer — the index (Nest module), its contract, or its outbox handlers.
        files: ["src/*.ts"],
        ignores: ["src/**/*.test.ts"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: [{
                    regex: "^@/features/[a-z-]+/(?!(contract|outbox)$).+",
                    message: "A feature only exports its protocol layer: import @/features/<feature> (module), its /contract or its /outbox.",
                }],
            }],
        },
    },
    {
        files: ["src/shared/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: [{ regex: "^@/features(/|$)", message: "Shared code must not depend on features." }],
            }],
        },
    },
    ...tseslint.config(
        ...tseslint.configs.recommendedTypeChecked,
        {
            languageOptions: {
                parserOptions: {
                    project: true,
                    tsconfigRootDir: __dirname,
                },
            },
            rules: {
                "@typescript-eslint/no-unsafe-argument": "off",
                "@typescript-eslint/no-unsafe-member-access": "off",
                "@typescript-eslint/no-unsafe-assignment": "off",
                "@typescript-eslint/no-unsafe-return": "off",
                "@typescript-eslint/no-unsafe-call": "off",
                "@typescript-eslint/no-misused-promises": "off",
                "@typescript-eslint/unbound-method": "off",
                "@typescript-eslint/no-unused-vars": [
                    "error",
                    { ignoreRestSiblings: true },
                ],
            },
        },
        {
            files: ["**/tasks/**/*.{js,ts}", "src/database/**/*.{js,ts}"],
            rules: {
                "no-console": "off",
                "@typescript-eslint/no-floating-promises": "off",
            },
        },
    ),
]);
