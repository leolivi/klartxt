/// <reference types="chrome" />

import { initTrackerData, type TrackerInfo } from "@/data/tracking-domains";
import { handleNetworkRequests } from "./handlers/handle-network-requets";

initTrackerData();

/* ---- CACHE MANAGER ---- */
class TrackerCache {
  private trackerDetails = new Map<number, Map<string, TrackerInfo>>();
  private timestamps = new Map<number, number>();
  private persistDebounceTimers = new Map<number, ReturnType<typeof setTimeout>>();

  addTrackerDetail(tabId: number, tracker: TrackerInfo): void {
    if (!this.trackerDetails.has(tabId)) {
      this.trackerDetails.set(tabId, new Map());
    }
    const existing = this.trackerDetails.get(tabId)!;
    if (existing.has(tracker.domain)) return;
    existing.set(tracker.domain, tracker);
    this.updateTimestamp(tabId);
    this.debouncedPersist(tabId);
  }

  getTrackerDetails(tabId: number): TrackerInfo[] {
    return Array.from(this.trackerDetails.get(tabId)?.values() ?? []);
  }

  getTimestamp(tabId: number): number | null {
    return this.timestamps.get(tabId) ?? null;
  }

  private updateTimestamp(tabId: number): void {
    this.timestamps.set(tabId, Date.now());
  }

  // storage only if necessary
  private async persistTab(tabId: number): Promise<void> {
    const data: Record<string, unknown> = {
      [`timestamp_${tabId}`]: this.timestamps.get(tabId),
      [`trackerDetails_${tabId}`]: Array.from(
        this.trackerDetails.get(tabId)?.values() ?? []
      ),
    };
    await chrome.storage.session.set(data);
  }

  private debouncedPersist(tabId: number): void {
    const existing = this.persistDebounceTimers.get(tabId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      this.persistTab(tabId);
      this.persistDebounceTimers.delete(tabId);
    }, 500);
    this.persistDebounceTimers.set(tabId, timer);
  }

  async restoreFromStorage(tabId: number): Promise<void> {
    const result = await chrome.storage.session.get([
      `trackerDetails_${tabId}`,
      `timestamp_${tabId}`,
    ]);

    const details = result[`trackerDetails_${tabId}`];
    if (Array.isArray(details)) {
      const detailMap = new Map<string, TrackerInfo>();
      (details as TrackerInfo[]).forEach((t) => detailMap.set(t.domain, t));
      this.trackerDetails.set(tabId, detailMap);
    }

    const ts = result[`timestamp_${tabId}`];
    if (typeof ts === "number") {
      this.timestamps.set(tabId, ts);
    }
  }

  reset(tabId: number): void {
    this.trackerDetails.delete(tabId);
    this.timestamps.delete(tabId);
  }

  clear(tabId: number): void {
    this.reset(tabId);
    chrome.storage.session.remove([
      `trackerDetails_${tabId}`,
      `timestamp_${tabId}`,
    ]);
  }
}

const cache = new TrackerCache();

/* ---- SIDE PANEL ---- */
chrome.sidePanel
  .setPanelBehavior({openPanelOnActionClick: true})
  .catch((error) => console.error(error));


/* ---- TAB UPDATE HANDLER ---- */
chrome.tabs.onUpdated.addListener(async(tabId, changeInfo) => {
  if (changeInfo.status === "loading" && changeInfo.url) {
    cache.reset(tabId);
  }

  if (changeInfo.status !== "complete") return;

  await cache.restoreFromStorage(tabId);
});

/* ---- NETWORK REQUEST HANDLER ---- */
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const tabId = details.tabId;
    if (tabId < 0) return undefined;

    // TODO: remove later
    const start = performance.now();

    handleNetworkRequests({
      details,
      onTrackerDetected: (tracker) => {
        cache.addTrackerDetail(tabId, tracker);
        const details = cache.getTrackerDetails(tabId);
        // TODO: remove later
        const elapsed = performance.now() - start;
        console.log(`Tracker (${details.length} total):`, details, `${elapsed.toFixed(3)}ms`);
      },
    });
    return undefined;
  },
  { urls: ["https://*/*", "http://*/*"] }
);

/* ---- TAB CLEANUP ---- */
chrome.tabs.onRemoved.addListener((tabId: number) => {
  cache.clear(tabId);
});