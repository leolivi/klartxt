import type { BrowserContext, Worker } from "@playwright/test";

type SessionStorage = Record<string, unknown>;
type ChromeLike     = { storage: { session: { get(keys: string[]): Promise<SessionStorage> } } };
type TabsLike       = { query(q: { url: string }): Promise<Array<{ id?: number }>> };
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
 * Opens a fresh page, navigates to `url`, waits for full page load,
 * then returns the extension's scan result.
 *
 * Uses chrome.tabs.query to resolve the tabId — no console-message dependency,
 * so sites with slow service-worker installs (e.g. Wikipedia) don't time out.
 */
export async function scanSite(
  context: BrowserContext,
  sw: Worker,
  url: string,
): Promise<ScanResult> {
  const page               = await context.newPage();
  const seenHostnames      = new Set<string>();
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

  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Resolve the Chrome tabId from the service worker using the final URL.
  // domcontentloaded ensures redirects have settled and page.url() is stable.
  const tabId = await sw.evaluate(async (finalUrl: string) => {
    const origin = new URL(finalUrl).origin;
    const tabs   = (globalThis as unknown as { chrome: { tabs: TabsLike } }).chrome.tabs;
    const found  = await tabs.query({ url: `${origin}/*` });
    return found[0]?.id ?? -1;
  }, page.url());

  if (tabId === -1) throw new Error(`Could not find Chrome tab for ${url}`);

  // Wait for full page load, then let debouncedPersist (500 ms) settle.
  // .catch() keeps the scan alive if a heavy page (e.g. Wikipedia SW pre-cache) times out.
  await page.waitForLoadState("load", { timeout: 60_000 }).catch(() => {});
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
  // __rescanCookies calls setCookies → isScanCompleted is true regardless of storage timing.
  const { extensionRequests, cookieDetails, scanCompleted } = await sw.evaluate((id: number) => {
    const c = (globalThis as unknown as { __klartxtCache: CacheLike }).__klartxtCache;
    return {
      extensionRequests: c?.getRequestsSeen(id)  ?? 0,
      cookieDetails:     c?.getCookieDetails(id)  ?? [],
      scanCompleted:     c?.isScanCompleted(id)   ?? false,
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
