import type { BrowserContext, Worker } from "@playwright/test";

type SessionStorage = Record<string, unknown>;
type ChromeLike     = { storage: { session: { get(keys: string[]): Promise<SessionStorage> } } };
type CacheLike      = { getRequestsSeen(tabId: number): number };

export type TrackerEntry = { domain: string };

export type ScanResult = {
  tabId:              number;
  score:              number;
  trackerDetails:     TrackerEntry[];
  scanCompleted:      boolean;
  seenHostnames:      Set<string>; // unique HTTP/HTTPS hostnames Playwright observed
  playwrightRequests: number;      // total request count Playwright observed
  extensionRequests:  number;      // total requests the extension's webRequest saw
};

/**
 * Opens a fresh page, navigates to `url`, waits for the extension's
 * [ScanDuration] signal, lets storage settle, then returns the scan result.
 *
 * A new page is created each call so the browser cache never hides requests
 * from the extension's webRequest interceptor on repeated scans of the same URL.
 */
export async function scanSite(
  context: BrowserContext,
  sw: Worker,
  url: string,
): Promise<ScanResult> {
  const page          = await context.newPage();
  const seenHostnames     = new Set<string>();
  let   playwrightRequests = 0;

  page.on("request", req => {
    try {
      const { protocol, hostname } = new URL(req.url());
      if (protocol === "http:" || protocol === "https:") {
        seenHostnames.add(hostname);
        playwrightRequests++;
      }
    } catch { /* ignore unparseable URLs */ }
  });

  const tabIdPromise = new Promise<number>(resolve => {
    sw.on("console", msg => {
      const m = msg.text().match(/\[ScanDuration\] tabId=(\d+) duration=/);
      if (m) resolve(Number(m[1]));
    });
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });
  const tabId = await tabIdPromise;

  // Wait for DSGVO checks and debouncedPersist to fully settle
  await page.waitForTimeout(3_000);

  const storage = await sw.evaluate((id: number) => {
    const chrome = (globalThis as unknown as { chrome: ChromeLike }).chrome;
    return chrome.storage.session.get([
      `scanCompleted_${id}`,
      `overallRiskScore_${id}`,
      `trackerDetails_${id}`,
    ]);
  }, tabId);

  // Read requestsSeen directly from the in-memory cache to avoid timing issues
  // with debouncedPersist (storage may not reflect the final count yet).
  const extensionRequests = await sw.evaluate((id: number) => {
    const c = (globalThis as unknown as { __klartxtCache: CacheLike }).__klartxtCache;
    return c?.getRequestsSeen(id) ?? 0;
  }, tabId);

  await page.close();

  return {
    tabId,
    score:          (storage[`overallRiskScore_${tabId}`] as number         | undefined) ?? 0,
    trackerDetails: (storage[`trackerDetails_${tabId}`]   as TrackerEntry[] | undefined) ?? [],
    scanCompleted:  (storage[`scanCompleted_${tabId}`]    as boolean        | undefined) ?? false,
    seenHostnames,
    playwrightRequests,
    extensionRequests,
  };
}
