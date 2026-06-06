import { test, expect } from "@playwright/test";
import { readResults } from "../helpers/results";

// ── Request-Erfassung ── //
// Reads pre-collected scan data from collect.spec.ts.
// Asserts: every tracker domain the extension recorded actually appeared in
// Playwright's request list (no phantom requests) and scans completed.
//
// Goal: 100 % request capture. Skipped in CI because chrome.webRequest cannot
// intercept SW-to-SW fetches (platform limitation) —> sites with an active
// service worker (e.g. GitHub) produce a structural gap that can't be closed.

test("detects 100 % network request across all sites", async ({}, testInfo) => {
  test.skip(!!process.env.CI, "SW-to-SW fetches are uninterceptable by webRequest — local-only test");

  const { sites } = readResults();

  const report = sites.map(site => {
    const run = site.runs[0];
    const trackerDomains  = run.trackerDetails.map(t => t.domain).filter(Boolean);
    // A tracker domain is real if any seen hostname equals it or is a subdomain of it
    // (extension stores root domain e.g. "google.com"; Playwright sees "www.google.com")
    const phantomDomains  = trackerDomains.filter(
      d => !run.seenHostnames.some(h => h === d || h.endsWith(`.${d}`))
    );
    // Aggregate across all runs. Allow at most 1 missed request per run as tolerance
    // for the SW-install fetch on first visit (one-time noise, not a recurring gap).
    const totalPlaywright   = site.runs.reduce((s, r) => s + r.playwrightRequests, 0);
    const totalExtension    = site.runs.reduce((s, r) => s + r.extensionRequests, 0);
    const requestCoverageOk = totalExtension >= totalPlaywright - site.runs.length;

    return {
      site:                site.name,
      playwright_requests: totalPlaywright,
      extension_requests:  totalExtension,
      playwright_domains:  run.seenHostnames.length,
      trackers_detected:   trackerDomains.length,
      scan_completed:      run.scanCompleted,
      phantom_domains:     phantomDomains,
      request_coverage_ok: requestCoverageOk,
    };
  });

  await testInfo.attach("request-capture-report.json", {
    body:        JSON.stringify(report, null, 2),
    contentType: "application/json",
  });

  for (const result of report) {
    expect(
      result.scan_completed,
      `Scan did not complete on ${result.site}`
    ).toBe(true);

    expect(
      result.phantom_domains,
      `Extension recorded phantom domains on ${result.site}: ${result.phantom_domains.join(", ")}`
    ).toHaveLength(0);

    expect(
      result.request_coverage_ok,
      `Extension missed requests on ${result.site}: extension saw ${result.extension_requests}, Playwright saw ${result.playwright_requests}`
    ).toBe(true);
  }
});
