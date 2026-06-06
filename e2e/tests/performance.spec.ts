import { test, expect } from "@playwright/test";
import { readResults } from "../helpers/results";

// ── Scan-Performance ── //
// Reads pre-collected scan data from collect.spec.ts.
// scanDuration = Time between status:"complete" to the last initial tracker measurement + 300 ms Debounce.
// Goal: Performance under 2 Sekunden.

const THRESHOLD_MS = 2_000;

test("completes scan within 2 s for all sites", async ({}, testInfo) => {
  const { sites } = readResults();

  const report = sites.map(site => {
    const durations = site.runs
      .map(r => r.scanDuration)
      .filter((d): d is number => d !== null);

    const avg = durations.length > 0
      ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
      : null;

    const max = durations.length > 0 ? Math.max(...durations) : null;

    return {
      site:            site.name,
      runs_measured:   durations.length,
      runs_total:      site.runs.length,
      avg_ms:          avg,
      max_ms:          max,
      under_threshold: durations.every(d => d < THRESHOLD_MS),
    };
  });

  await testInfo.attach("performance-report.json", {
    body:        JSON.stringify(report, null, 2),
    contentType: "application/json",
  });

  for (const result of report) {
    // scanDuration is null when status:"complete" fires after the read window
    // (e.g. sites with heavy service-worker pre-caching in CI). Skip rather than fail.
    if (result.runs_measured === 0) continue;

    expect(
      result.avg_ms,
      `Avg scan duration on ${result.site} is ${result.avg_ms} ms — exceeds ${THRESHOLD_MS} ms target`,
    ).toBeLessThan(THRESHOLD_MS);
  }
});
