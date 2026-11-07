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
    ...nextCoreWebVitals.map((config) => ({ ...config, files: ["apps/web/**/*.{ts,tsx}"] })),
    { settings: { next: { rootDir: "apps/web/" } } },
    globalIgnores([
        "**/*.d.ts",
        "**/playwright-report/**",
        "**/.next/**",
        "**/dist/**",
        "**/*.js",
        // Tauri sidecar packaging of the old single Next.js server, not yet adapted to api + web
        "server.ts",
        "inspector-polyfill.ts",
    ]),
    ...tseslint.config(
        ...tseslint.configs.recommendedTypeChecked,
        {
            languageOptions: {
                parserOptions: {
                    projectService: true,
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
            files: ["**/tasks/**/*.{js,ts}", "apps/api/src/database/**/*.{js,ts}", "apps/api/src/main.ts"],
            rules: {
                "no-console": "off",
                "@typescript-eslint/no-floating-promises": "off",
            },
        },
    ),
]);
