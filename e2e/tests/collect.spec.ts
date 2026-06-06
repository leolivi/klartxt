import { test } from "@playwright/test";
import fs from "fs";
import sitesData from "../sites.json" with { type: "json" };
import { launchWithExtension } from "../fixtures/extension";
import { scanSite } from "../helpers/scan";
import { RESULTS_PATH, type CollectedResults } from "../helpers/results";

// ── Data collection ── //
// Runs 3 scans per site and writes test-results-data.json.
// further tests read that file instead of scanning again.

test("collects scan data for all sites", async () => {
  test.setTimeout(15 * 60_000); // up to 15 min: 5 sites × 3 scans × ~90 s CI budget

  const collected: CollectedResults = { sites: [] };

  for (const site of sitesData.sites) {
    const context = await launchWithExtension();

    let sw = context.serviceWorkers()[0];
    if (!sw) sw = await context.waitForEvent("serviceworker", { timeout: 5_000 });

    const runs = [];
    for (let i = 0; i < 3; i++) {
      const { score, trackerDetails, cookieDetails, seenHostnames, scanCompleted, scanDuration, playwrightRequests, extensionRequests, pageErrors, swErrors } =
        await scanSite(context, sw, site.url);
      runs.push({
        score,
        trackerDetails,
        cookieDetails,
        seenHostnames: [...seenHostnames],
        scanCompleted,
        scanDuration,
        playwrightRequests,
        extensionRequests,
        pageErrors,
        swErrors,
      });
    }

    await context.close();
    collected.sites.push({ name: site.name, url: site.url, runs });
  }

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(collected, null, 2));
});
