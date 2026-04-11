/// <reference types="chrome" />

import { initTrackerData, type TrackerInfo } from "@/data/tracking-domains";
import { handleNetworkRequests } from "./handlers/handle-network-requets";

initTrackerData();

/* ---- CACHE MANAGER ---- */
class TrackerCache {
  private trackerDetails = new Map<number, Map<string, TrackerInfo>>();
  private timestamps = new Map<number, number>();

  addTrackerDetail(tabId: number, tracker: TrackerInfo): void {
    if (!this.trackerDetails.has(tabId)) {
      this.trackerDetails.set(tabId, new Map());
    }
    const existing = this.trackerDetails.get(tabId)!;
    if (existing.has(tracker.domain)) return;
    existing.set(tracker.domain, tracker);
    this.updateTimestamp(tabId);
    this.persistTab(tabId);
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
const FILTERED_PROTOCOLS = ["data:", "blob:", "chrome://", "chrome-extension://"];

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
    if (tabId < 0 || FILTERED_PROTOCOLS.some((p) => details.url.startsWith(p))) return undefined;

    handleNetworkRequests({
      details,
      onTrackerDetected: (tracker) => {
        cache.addTrackerDetail(tabId, tracker);
        const details = cache.getTrackerDetails(tabId);
        // TODO: remove later
        console.log(`Tracker (${details.length} total):`, details);
      },
    });
    return undefined;
  },
  { urls: ["<all_urls>"] }
);

/* ---- TAB CLEANUP ---- */
chrome.tabs.onRemoved.addListener((tabId: number) => {
  cache.clear(tabId);
});