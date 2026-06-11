import { test, expect } from "@playwright/test";
import { readResults } from "../helpers/results";
import { parse as parseTld } from "tldts";

function rootDomain(hostname: string): string {
  return parseTld(hostname.replace(/^\./, "")).domain ?? hostname;
}

// ── Cookie-Erfassung ── //
// Reads pre-collected scan data from collect.spec.ts.
//
// What this test validates:
//   1. Classification integrity: every detected cookie carries an explicit isThirdParty boolean.
//   2. No phantom cookies: every cookie domain the extension reports must appear in
//      Playwright's seen hostnames (or be the first-party domain).
//      The extension should not invent cookies from domains that were never requested.
//
// Note on third_party_cookies (isThirdParty === true):
//   Cross-origin cookies are almost never present on automated initial load,
//   they require JS tracking scripts to fire and the browser to store them.
//   Tracking cookies like _ga or _fbp are typically stored first-party (under the
//   page domain) but correctly classified as "tracking" by name heuristics.

test("captures and classifies cookies with first/third-party status", async ({}, testInfo) => {
  const { sites } = readResults();

  const report = sites.map(site => {
    const run           = site.runs[0];
    const cookies       = run.cookieDetails;
    const missingStatus = cookies.filter(c => typeof c.isThirdParty !== "boolean");

    const siteRootDomain = rootDomain(new URL(site.url).hostname);
    // A cookie domain is real if its root domain matches the page domain (first-party)
    // or any Playwright-seen hostname is a subdomain / exact match of it
    const phantomCookies = cookies.filter(c => {
      const cookieRoot = rootDomain(c.domain.replace(/^\./, ""));
      if (cookieRoot === siteRootDomain) return false; // first-party — always real
      return !run.seenHostnames.some(h => h === cookieRoot || h.endsWith(`.${cookieRoot}`));
    });

    return {
      site:                 site.name,
      total_cookies:        cookies.length,
      first_party_cookies:  cookies.filter(c => !c.isThirdParty).length,
      third_party_cookies:  cookies.filter(c =>  c.isThirdParty).length,
      tracking_cookies:     cookies.filter(c => c.userCategory === "tracking").length,
      missing_party_status: missingStatus.map(c => c.name),
      phantom_cookies:      phantomCookies.map(c => `${c.name}@${c.domain}`),
      scan_completed:       run.scanCompleted,
    };
  });

  await testInfo.attach("cookie-capture-report.json", {
    body:        JSON.stringify(report, null, 2),
    contentType: "application/json",
  });

  for (const result of report) {
    expect(
      result.missing_party_status,
      `Cookies without first/third-party status on ${result.site}: ${result.missing_party_status.join(", ")}`
    ).toHaveLength(0);

    expect(
      result.phantom_cookies,
      `Extension reported phantom cookie domains on ${result.site}: ${result.phantom_cookies.join(", ")}`
    ).toHaveLength(0);
  }
});
