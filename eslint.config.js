import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
      { rules: { "react-refresh/only-export-components": ["warn", { allowConstantExport: true }] } },
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // Playwright requires {} destructuring for the fixtures argument in test().
    // no-empty-pattern would flag every test that uses no built-in fixtures.
    files: ["e2e/**/*.{ts,spec.ts}"],
    rules: { "no-empty-pattern": "off" },
  },
]);
