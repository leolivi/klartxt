import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir:  "./e2e/tests",
  timeout:  30_000,
  retries:  0,
  // extension shares one Chrome instance because parallel runs would interfere and cause errors
  workers: 1,
  reporter: [
    ["html",  { outputFolder: "e2e/report", open: "never" }],
    ["list"],
    ["./e2e/reporters/csv-reporter.ts"],
  ],
  use: {
    // Chrome extensions require headful mode (headless: false)
    headless: false,
    trace: "on-first-retry",
  },
  projects: [
    // Runs first: scans all sites and writes test-results-data.json.
    // If this fails, all tests in "tests" are automatically skipped.
    {
      name:      "setup",
      testMatch: "**/collect.spec.ts",
    },
    // all assertion tests depend on setup having written the results file.
    {
      name:       "tests",
      use:        { browserName: "chromium" },
      dependencies: ["setup"],
      testIgnore: "**/collect.spec.ts",
    },
  ],
});
