import { test, expect } from "@playwright/test";
import { readResults } from "../helpers/results";

// ── Cookie-Erfassung ── //
// Reads pre-collected scan data from collect.spec.ts.
// Asserts: cookies are detected and every cookie has a first/third-party status

// Sites expected to set cookies at all
// TODO: update after implementing the "real list"
const COOKIE_SITES = new Set(["google", "spiegel", "nzz"]);
// Content sites that embed third-party trackers → must have third-party cookies
const THIRD_PARTY_COOKIE_SITES = new Set(["spiegel", "nzz"]);

test("captures and classifies cookies with first/third-party status", async ({}, testInfo) => {
  const { sites } = readResults();

  const report = sites.map(site => {
    const run = site.runs[0];
    const cookies       = run.cookieDetails;
    const firstParty     = cookies.filter(c => !c.isThirdParty);
    const thirdParty     = cookies.filter(c =>  c.isThirdParty);
    const trackingCookies = cookies.filter(c => c.userCategory === "tracking");
    // Every cookie must have isThirdParty as an explicit boolean
    const missingStatus  = cookies.filter(c => typeof c.isThirdParty !== "boolean");

    return {
      site:                  site.name,
      total_cookies:         cookies.length,
      first_party_cookies:   firstParty.length,
      third_party_cookies:   thirdParty.length,
      tracking_cookies:      trackingCookies.length,
      missing_party_status:  missingStatus.map(c => c.name),
      scan_completed:        run.scanCompleted,
    };
  });

  await testInfo.attach("cookie-capture-report.json", {
    body:        JSON.stringify(report, null, 2),
    contentType: "application/json",
  });

  for (const result of report) {
    expect(
      result.scan_completed,
      `Scan did not complete on ${result.site}`
    ).toBe(true);

    expect(
      result.missing_party_status,
      `Cookies without first/third-party status on ${result.site}: ${result.missing_party_status.join(", ")}`
    ).toHaveLength(0);

    if (COOKIE_SITES.has(result.site)) {
      expect(
        result.total_cookies,
        `No cookies detected on ${result.site} — cookie detection may be broken`
      ).toBeGreaterThan(0);
    }

    if (THIRD_PARTY_COOKIE_SITES.has(result.site)) {
      // Tracker cookies (e.g. _uetsid, __gads) are stored under the site's own domain
      // but classified as "tracking" by name heuristics — isThirdParty is domain-based
      // and correctly false for same-domain storage.
      expect(
        result.tracking_cookies,
        `No tracking cookies detected on ${result.site} — cookie categorisation may be broken`
      ).toBeGreaterThan(0);
    }
  }
});
