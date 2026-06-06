import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir:  "./e2e/tests",
  timeout:  30_000,
  retries:  0,
  // Serial: extension shares one Chrome instance — parallel runs would interfere
  workers: 1,
  reporter: [
    ["html",  { outputFolder: "e2e/report", open: "never" }],
    ["list"],
  ],
  use: {
    // Chrome extensions require headful mode (headless: false)
    // For CI: run with Xvfb or set DISPLAY env var
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
    // All assertion tests — depend on setup having written the results file.
    {
      name:       "tests",
      use:        { browserName: "chromium" },
      dependencies: ["setup"],
      testIgnore: "**/collect.spec.ts",
    },
  ],
});
