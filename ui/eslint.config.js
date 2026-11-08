const { defineConfig, globalIgnores } = require("eslint/config");
const js = require("@eslint/js");
const globals = require("globals");
const tseslint = require("typescript-eslint");
const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");

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
    globalIgnores(["**/*.d.ts", ".next/**", "**/*.js"]),
    {
        // Playwright fixtures: `use` is not a React hook, and `({}, use)` is Playwright's required form
        files: ["e2e/**/*.ts"],
        rules: {
            "react-hooks/rules-of-hooks": "off",
            "no-empty-pattern": "off",
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
    ),
]);
