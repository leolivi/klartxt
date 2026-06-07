import { test, expect } from "@playwright/test";
import sitesData from "../sites.json" with { type: "json" };
import { launchWithExtension } from "../fixtures/extension";

// ── Cold Start & Storage-Wiederherstellung ── //
// Service workers can be terminated by the browser after ~30 s of inactivity.
// On restart the extension must rebuild its in-memory state from session storage.
// This test simulates that cycle for every site:
//   1. Scan a page → data lands in memory + session storage
//   2. cache.reset() → wipes memory (session storage intact, no debouncedPersist)
//   3. cache.restoreFromStorage() → rebuilds memory from storage
//   4. Assert restored data matches what was in session storage

type CacheForTest = {
  reset(tabId: number): void;
  restoreFromStorage(tabId: number): Promise<void>;
  getTrackerDetails(tabId: number): unknown[];
  getCookieDetails(tabId: number): unknown[];
  isScanCompleted(tabId: number): boolean;
};
type ChromeLike = { storage: { session: { get(keys: string[]): Promise<Record<string, unknown>> } } };
type TabsLike   = { query(q: { url: string }): Promise<Array<{ id?: number }>> };

test("restores cache state from session storage after cold start", async () => {
  test.setTimeout(5 * 60_000);

  for (const site of sitesData.sites) {
    const context = await launchWithExtension();
    let sw = context.serviceWorkers()[0];
    if (!sw) sw = await context.waitForEvent("serviceworker", { timeout: 5_000 });

    const page = await context.newPage();
    await page.goto(site.url, { waitUntil: "domcontentloaded" });

    const tabId = await sw.evaluate(async (finalUrl: string) => {
      const origin = new URL(finalUrl).origin;
      const tabs   = (globalThis as unknown as { chrome: { tabs: TabsLike } }).chrome.tabs;
      const found  = await tabs.query({ url: `${origin}/*` });
      return found[0]?.id ?? -1;
    }, page.url());

    expect(tabId, `[${site.name}] Could not resolve Chrome tab ID`).toBeGreaterThan(0);

    await page.waitForLoadState("load", { timeout: 60_000 }).catch(() => {});
    await page.waitForTimeout(3_000);

    await sw.evaluate(async (id: number) => {
      const rescan = (globalThis as unknown as { __rescanCookies?: (tabId: number) => Promise<void> }).__rescanCookies;
      await rescan?.(id);
    }, tabId);

    // Wait for scheduleUIUpdate debounce (300 ms) + debouncedPersist (500 ms) + margin.
    await page.waitForTimeout(2_000);

    // ── session storage 
    const stored = await sw.evaluate(async (id: number) => {
      const chrome = (globalThis as unknown as { chrome: ChromeLike }).chrome;
      const result = await chrome.storage.session.get([
        `trackerDetails_${id}`,
        `cookieDetails_${id}`,
        `scanCompleted_${id}`,
      ]);
      return {
        trackerCount:  ((result[`trackerDetails_${id}`] as unknown[]) ?? []).length,
        cookieCount:   ((result[`cookieDetails_${id}`]  as unknown[]) ?? []).length,
        scanCompleted: (result[`scanCompleted_${id}`]   as boolean)   ?? false,
      };
    }, tabId);

    // Simulate cold start: wipe in-memory state and immediately read back
    // (single evaluate = atomic w.r.t. the JS event loop — no webRequest
    // event can fire setTrackerDetail between reset() and the length reads)
    const afterReset = await sw.evaluate((id: number) => {
      const c = (globalThis as unknown as { __klartxtCache: CacheForTest }).__klartxtCache;
      c.reset(id);
      return {
        trackerCount:  c.getTrackerDetails(id).length,
        cookieCount:   c.getCookieDetails(id).length,
        scanCompleted: c.isScanCompleted(id),
      };
    }, tabId);

    expect(afterReset.trackerCount,  `[${site.name}] Trackers must be gone after memory reset`).toBe(0);
    expect(afterReset.cookieCount,   `[${site.name}] Cookies must be gone after memory reset`).toBe(0);
    expect(afterReset.scanCompleted, `[${site.name}] scanCompleted must be false after memory reset`).toBe(false);

    // Restore from session storage 
    await sw.evaluate(async (id: number) => {
      await (globalThis as unknown as { __klartxtCache: CacheForTest }).__klartxtCache.restoreFromStorage(id);
    }, tabId);

    // Verify restoration matches session storage 
    const afterRestore = await sw.evaluate((id: number) => {
      const c = (globalThis as unknown as { __klartxtCache: CacheForTest }).__klartxtCache;
      return {
        trackerCount:  c.getTrackerDetails(id).length,
        cookieCount:   c.getCookieDetails(id).length,
        scanCompleted: c.isScanCompleted(id),
      };
    }, tabId);


    expect(afterRestore.trackerCount,  `[${site.name}] Trackers must be restored from session storage`).toBeGreaterThanOrEqual(stored.trackerCount);
    expect(afterRestore.cookieCount,   `[${site.name}] Cookies must be restored from session storage`).toBeGreaterThanOrEqual(stored.cookieCount);
    expect(afterRestore.scanCompleted, `[${site.name}] scanCompleted must be restored from session storage`).toBe(stored.scanCompleted);

    await page.close();
    await context.close();
  }
});
