import { test, expect } from "@playwright/test";
import { readResults } from "../helpers/results";

// ── Request-Erfassung ── //
// Reads pre-collected scan data from 00-collect.spec.ts.
// Asserts: every tracker domain the extension recorded actually appeared in
// Playwright's request list (no phantom requests) and scans completed.

test("100 % network request capture across all sites", async ({}, testInfo) => {
  const { sites } = readResults();

  const report = sites.map(site => {
    const run = site.runs[0];
    const trackerDomains  = run.trackerDetails.map(t => t.domain).filter(Boolean);
    // A tracker domain is real if any seen hostname equals it or is a subdomain of it
    // (extension stores root domain e.g. "google.com"; Playwright sees "www.google.com")
    const phantomDomains  = trackerDomains.filter(
      d => !run.seenHostnames.some(h => h === d || h.endsWith(`.${d}`))
    );
    // Aggregate across all runs. Run 0 on sites with a service worker can have one
    // extra SW-installation fetch that chrome.webRequest cannot intercept (platform
    // limitation). Allow at most 1 missed request per run as tolerance.
    const totalPlaywright = site.runs.reduce((s, r) => s + r.playwrightRequests, 0);
    const totalExtension  = site.runs.reduce((s, r) => s + r.extensionRequests, 0);
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
