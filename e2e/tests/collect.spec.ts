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
  test.setTimeout(30 * 60_000); // up to 30 min: 25 sites × 3 scans × fresh context per run

  const collected: CollectedResults = { sites: [] };

  for (const site of sitesData.sites) {
    const runs = [];

    for (let i = 0; i < 3; i++) {
      // Fresh context per run: cookies, localStorage, sessionStorage and SW cache
      // are all reset. This ensures each scan represents an independent first visit
      const context = await launchWithExtension();

      let sw = context.serviceWorkers()[0];
      if (!sw) sw = await context.waitForEvent("serviceworker", { timeout: 5_000 });

      const { score, trackerDetails, cookieDetails, seenHostnames, scanCompleted, scanDuration, playwrightRequests, extensionRequests, pageErrors, swErrors } =
        await scanSite(context, sw, site.url);

      await context.close();

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

    collected.sites.push({ name: site.name, url: site.url, runs });
  }

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(collected, null, 2));
});
