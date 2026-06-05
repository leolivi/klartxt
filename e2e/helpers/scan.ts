import type { BrowserContext, Worker } from "@playwright/test";

type SessionStorage = Record<string, unknown>;
type ChromeLike     = { storage: { session: { get(keys: string[]): Promise<SessionStorage> } } };
type CacheLike      = { getRequestsSeen(tabId: number): number; getCookieDetails(tabId: number): CookieEntry[]; isScanCompleted(tabId: number): boolean };

export type TrackerEntry = { domain: string };
export type CookieEntry  = { name: string; domain: string; category: string; userCategory: string; isThirdParty: boolean; httpOnly: boolean; secure: boolean };

export type ScanResult = {
  tabId:              number;
  score:              number;
  trackerDetails:     TrackerEntry[];
  cookieDetails:      CookieEntry[];
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

  const tabIdPromise = new Promise<number>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`[ScanDuration] signal not received within 90s for ${url}`)),
      90_000,
    );
    sw.on("console", msg => {
      const m = msg.text().match(/\[ScanDuration\] tabId=(\d+) duration=/);
      if (m) { clearTimeout(timer); resolve(Number(m[1])); }
    });
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });
  const tabId = await tabIdPromise;

  // Wait for DSGVO checks and debouncedPersist to fully settle
  await page.waitForTimeout(3_000);

  const storage = await sw.evaluate((id: number) => {
    const chrome = (globalThis as unknown as { chrome: ChromeLike }).chrome;
    return chrome.storage.session.get([
      `overallRiskScore_${id}`,
      `trackerDetails_${id}`,
    ]);
  }, tabId);

  // Trigger a fresh cookie scan so JS-set tracker cookies (set after status:complete)
  // are included. __rescanCookies is only available in e2e builds.
  await sw.evaluate(async (id: number) => {
    const rescan = (globalThis as unknown as { __rescanCookies?: (tabId: number) => Promise<void> }).__rescanCookies;
    await rescan?.(id);
  }, tabId);

  // Read requestsSeen, cookieDetails, and scanCompleted directly from the in-memory cache.
  // __rescanCookies above calls setCookies → isScanCompleted returns true even when
  // status:"complete" fires after the 3s storage-read window (e.g. heavy sites like NZZ).
  const { extensionRequests, cookieDetails, scanCompleted } = await sw.evaluate((id: number) => {
    const c = (globalThis as unknown as { __klartxtCache: CacheLike }).__klartxtCache;
    return {
      extensionRequests: c?.getRequestsSeen(id)   ?? 0,
      cookieDetails:     c?.getCookieDetails(id)   ?? [],
      scanCompleted:     c?.isScanCompleted(id)    ?? false,
    };
  }, tabId);

  await page.close();

  return {
    tabId,
    score:          (storage[`overallRiskScore_${tabId}`] as number         | undefined) ?? 0,
    trackerDetails: (storage[`trackerDetails_${tabId}`]   as TrackerEntry[] | undefined) ?? [],
    cookieDetails,
    scanCompleted,
    seenHostnames,
    playwrightRequests,
    extensionRequests,
  };
}
