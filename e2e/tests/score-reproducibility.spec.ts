import { test, expect } from "@playwright/test";
import { readResults } from "../helpers/results";

const REPRODUCIBILITY_THRESHOLD = 0.8;

// ── Score reproducibility ── //
// Reads pre-collected scan data from 00-collect.spec.ts.
// Asserts: >= 80 % of sites produce identical scores across all 3 runs.

test("overall >= 80 %", async ({}, testInfo) => {
  const { sites } = readResults();

  const siteResults = sites.map(site => ({
    name:         site.name,
    scores:       site.runs.map(r => r.score) as [number, number, number],
    reproducible: site.runs.every(r => r.score === site.runs[0].score),
  }));

  const reproducible    = siteResults.filter(r => r.reproducible);
  const tested          = siteResults.length;
  const rate            = tested > 0 ? reproducible.length / tested : 0;
  const ratePercent     = Math.round(rate * 100);
  const thresholdPercent = Math.round(REPRODUCIBILITY_THRESHOLD * 100); // 80

  const report = {
    scans_total:  tested,
    reproducible: reproducible.length,
    rate:         `${ratePercent} %`,
    threshold:    `${thresholdPercent} %`,
    result:       ratePercent >= thresholdPercent ? "PASS" : "FAIL",
    sites:        siteResults.map(r => ({ name: r.name, scores: r.scores, reproducible: r.reproducible })),
  };

  await testInfo.attach("reproducibility-report.json", {
    body:        JSON.stringify(report, null, 2),
    contentType: "application/json",
  });

  expect(
    ratePercent,
    `Reproducibility ${ratePercent} % is below the required ${thresholdPercent} %.`
  ).toBeGreaterThanOrEqual(thresholdPercent);
});
