import { expect, test } from "@playwright/test";
import { launchWithExtension } from "../fixtures/extension";
import { getExtensionId, sidepanelUrl } from "../helpers/extension-id";
import sitesData from "../sites.json" with { type: "json" };

// ── Extension loads ── //

test("extension loads and sidepanel opens", async () => {
  const context = await launchWithExtension();

  // Service worker must register -> proves the extension loaded successfully
  let sw = context.serviceWorkers()[0];
  if (!sw) sw = await context.waitForEvent("serviceworker", { timeout: 5_000 });
  expect(sw.url()).toContain("chrome-extension://");

  const extensionId = await getExtensionId(context);
  expect(extensionId).toBeTruthy();

  // Open the sidepanel as a tab and verify it renders
  const sidepanel = await context.newPage();
  await sidepanel.goto(sidepanelUrl(extensionId));
  await expect(sidepanel).toHaveTitle(/klartxt/i);

  await context.close();
});

// ── Scan runs and produces data ── //

const github = sitesData.sites.find(s => s.name === "github")!;

test(`scan completes and loads data from a testpage`, async ({}, testInfo) => {
  const context = await launchWithExtension();
  const extensionId = await getExtensionId(context);
  const page = await context.newPage();

  let sw = context.serviceWorkers()[0];
  if (!sw) sw = await context.waitForEvent("serviceworker", { timeout: 5_000 });

  // Listen before navigating to avoid missing the log
  const tabIdPromise = new Promise<number>(resolve => {
    sw.on("console", msg => {
      const m = msg.text().match(/\[ScanDuration\] tabId=(\d+) duration=/);
      if (m) resolve(Number(m[1]));
    });
  });

  await page.goto(github.url, { waitUntil: "domcontentloaded" });
  const tabId = await tabIdPromise;

  // DSGVO checks arrive ~1 s after [ScanDuration] and reset debouncedPersist.
  // Wait for all events to settle before reading storage.
  await page.waitForTimeout(2_000);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const storage = await sw.evaluate(async (id: number) => {
    const c = (globalThis as any).chrome;
    return c.storage.session.get([`scanCompleted_${id}`, `overallRiskScore_${id}`]);
  }, tabId);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Open sidepanel pinned to the scanned tab -> screenshot shows real scan data
  const sidepanel = await context.newPage();
  await sidepanel.goto(sidepanelUrl(extensionId, tabId, github.url));
  await expect(sidepanel.getByTestId("header-scan-status")).toBeVisible();
  await testInfo.attach("sidepanel.png", {
    body: await sidepanel.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await context.close();

  expect(storage[`scanCompleted_${tabId}`]).toBe(true);
  expect(storage[`overallRiskScore_${tabId}`]).toBeGreaterThanOrEqual(1);
});
