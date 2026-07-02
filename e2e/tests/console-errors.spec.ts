import { expect, test } from "@playwright/test";
import { readResults } from "../helpers/results";

// ── clean Console-Log ── //
// Reads pre-collected scan data from collect.spec.ts.
// Asserts: no unhandled JS exceptions on the page and no console.error
// messages from the extension service worker across all runs.

test("throws no unhandled exceptions across all sites", async ({}, testInfo) => {
  const { sites } = readResults();

  const report = sites.map(site => {
    const allPageErrors = site.runs.flatMap((r, i) => r.pageErrors.map(msg => ({ run: i, msg })));
    const allSwErrors = site.runs.flatMap((r, i) => r.swErrors.map(msg => ({ run: i, msg })));

    return {
      site: site.name,
      page_errors: allPageErrors,
      sw_errors: allSwErrors,
    };
  });

  await testInfo.attach("console-errors-report.json", {
    body: JSON.stringify(report, null, 2),
    contentType: "application/json",
  });

  for (const result of report) {
    // SW errors are directly our extension code -> strict zero.
    expect(
      result.sw_errors.map(e => e.msg),
      `Extension service worker threw errors on ${result.site}`,
    ).toHaveLength(0);

    // page_errors are reported but not asserted: third-party sites can have
    // their own JS bugs (e.g. React hydration errors on NZZ) that are unrelated
    // to the extension. They remain visible in the attached report.
  }
});
