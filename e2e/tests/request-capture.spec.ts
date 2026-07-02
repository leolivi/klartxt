import { expect, test } from "@playwright/test";
import { readResults } from "../helpers/results";

// ── Request-Erfassung ── //
// Reads pre-collected scan data from collect.spec.ts.
//
// What this test validates:
//   1. Scan completion: every site must finish scanning.
//   2. No phantom domains: every tracker domain the extension reports must appear in Playwright's seen hostnames.
//      The extension should not invent trackers that were never requested.
//   3. Minimum coverage: extension saw > 0 requests (basic sanity).
//
// Why raw request-count comparison is NOT used:
//   chrome.webRequest cannot intercept SW-to-SW fetches. Sites with active
//   service workers (e.g. Mozilla pre-caches Firefox docs, Vimeo pre-caches
//   video chunks) show gaps of 10–50+ req/run that are a Chrome API limitation,
//   not an extension bug. A count comparison would make this test permanently
//   flaky across the 25-site sample. The phantom-domain check is the correct
//   proxy: if the extension claims a tracker domain, that domain must be real.

test("captures network requests and reports no phantom domains", async ({}, testInfo) => {
  const { sites } = readResults();

  const report = sites.map(site => {
    const run = site.runs[0];
    const trackerDomains = run.trackerDetails.map(t => t.domain).filter(Boolean);
    // A tracker domain is real if any seen hostname equals it or is a subdomain of it
    // (extension stores root domain e.g. "google.com"; Playwright sees "www.google.com")
    const phantomDomains = trackerDomains.filter(d => !run.seenHostnames.some(h => h === d || h.endsWith(`.${d}`)));

    const totalPlaywright = site.runs.reduce((s, r) => s + r.playwrightRequests, 0);
    const totalExtension = site.runs.reduce((s, r) => s + r.extensionRequests, 0);
    const swGap = totalPlaywright - totalExtension;

    return {
      site: site.name,
      playwright_total: totalPlaywright,
      extension_total: totalExtension,
      sw_gap: swGap,
      sw_gap_per_run: Math.round(swGap / site.runs.length),
      trackers_detected: trackerDomains.length,
      scan_completed: run.scanCompleted,
      phantom_domains: phantomDomains,
    };
  });

  await testInfo.attach("request-capture-report.json", {
    body: JSON.stringify(report, null, 2),
    contentType: "application/json",
  });

  for (const result of report) {
    expect(result.scan_completed, `Scan did not complete on ${result.site}`).toBe(true);

    expect(
      result.phantom_domains,
      `Extension recorded phantom domains on ${result.site}: ${result.phantom_domains.join(", ")}`,
    ).toHaveLength(0);

    expect(
      result.extension_total,
      `Extension saw 0 requests on ${result.site} -> webRequest listener may not be active`,
    ).toBeGreaterThan(0);
  }
});
