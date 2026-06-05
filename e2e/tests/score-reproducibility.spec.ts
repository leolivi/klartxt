import { test, expect } from "@playwright/test";
import sitesData from "../sites.json" with { type: "json" };
import { launchWithExtension } from "../fixtures/extension";

const REPRODUCIBILITY_THRESHOLD = 0.8;

// ── Score reproducibility ── //
// Per-site tests collect scores (no assertions — so serial mode never stops early).
// The summary test is the single pass/fail gate for the >= 80 % MUST criterion.

test.describe("score reproducibility", () => {
  test.describe.configure({ mode: "serial" });

  const siteResults: Array<{ name: string; scores: [number, number, number] }> = [];

  for (const site of sitesData.sites) {
    test(`score is reproducible —> ${site.name}`, async ({}, testInfo) => {
      test.setTimeout(90_000); // 3 scans × ~10 s each (navigate + 3 s settle)
      const context = await launchWithExtension();

      let sw = context.serviceWorkers()[0];
      if (!sw) sw = await context.waitForEvent("serviceworker", { timeout: 5_000 });

      async function runScan(): Promise<number> {
        // Fresh page per scan — reusing the same page causes run 2+ to load from
        // browser cache, so no network requests go out and [ScanDuration] never fires.
        const page = await context.newPage();

        const tabIdPromise = new Promise<number>(resolve => {
          sw.on("console", msg => {
            const m = msg.text().match(/\[ScanDuration\] tabId=(\d+) duration=/);
            if (m) resolve(Number(m[1]));
          });
        });

        await page.goto(site.url, { waitUntil: "domcontentloaded" });
        const tabId = await tabIdPromise;

        // Wait for DSGVO checks and debouncedPersist to fully settle
        await page.waitForTimeout(3_000);

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const s = await sw.evaluate(async (id: number) => {
          const c = (globalThis as any).chrome;
          return c.storage.session.get([`overallRiskScore_${id}`]);
        }, tabId);
        /* eslint-enable @typescript-eslint/no-explicit-any */

        await page.close();
        return (s[`overallRiskScore_${tabId}`] as number) ?? 0;
      }

      const score1 = await runScan();
      const score2 = await runScan();
      const score3 = await runScan();

      await testInfo.attach("scores.json", {
        body:        JSON.stringify({ site: site.name, runs: [score1, score2, score3] }, null, 2),
        contentType: "application/json",
      });

      await context.close();

      siteResults.push({ name: site.name, scores: [score1, score2, score3] });
    });
  }

  // ── Summary ── //

  test("overall >= 80 %", async ({}, testInfo) => {
    const reproducible = siteResults.filter(
      r => r.scores[0] === r.scores[1] && r.scores[1] === r.scores[2]
    );
    const tested           = siteResults.length;
    const rate             = tested > 0 ? reproducible.length / tested : 0;
    const ratePercent      = Math.round(rate * 100);
    const thresholdPercent = Math.round(REPRODUCIBILITY_THRESHOLD * 100); // 80

    const report = {
      scans_total:  tested,
      reproducible: reproducible.length,
      rate:         `${ratePercent} %`,
      threshold:    `${thresholdPercent} %`,
      result:       ratePercent >= thresholdPercent ? "PASS" : "FAIL",
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
});
