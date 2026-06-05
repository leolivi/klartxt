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
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
