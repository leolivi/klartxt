import { test } from "@playwright/test";
import fs from "fs";
import sitesData from "../sites.json" with { type: "json" };
import { launchWithExtension } from "../fixtures/extension";
import { scanSite } from "../helpers/scan";
import { RESULTS_PATH, type CollectedResults } from "../helpers/results";

// ── Data collection ── //
// Runs 3 scans per site and writes test-results-data.json.
// score-reproducibility.spec.ts and request-capture.spec.ts read that file
// instead of scanning again — each site is only visited once.

test("collect scan data for all sites", async () => {
  test.setTimeout(10 * 60_000); // up to 10 min: 5 sites × 3 scans × ~10 s

  const collected: CollectedResults = { sites: [] };

  for (const site of sitesData.sites) {
    const context = await launchWithExtension();

    let sw = context.serviceWorkers()[0];
    if (!sw) sw = await context.waitForEvent("serviceworker", { timeout: 5_000 });

    const runs = [];
    for (let i = 0; i < 3; i++) {
      const { score, trackerDetails, seenHostnames, scanCompleted, playwrightRequests, extensionRequests } =
        await scanSite(context, sw, site.url);
      runs.push({
        score,
        trackerDetails,
        seenHostnames: [...seenHostnames],
        scanCompleted,
        playwrightRequests,
        extensionRequests,
      });
    }

    await context.close();
    collected.sites.push({ name: site.name, url: site.url, runs });
  }

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(collected, null, 2));
});
