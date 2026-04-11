/// <reference types="chrome" />

import { initTrackerData, type TrackerInfo } from "@/data/tracking-domains";
import { handleNetworkRequests } from "./handlers/handle-network-requets";

initTrackerData();

/* ---- CACHE MANAGER ---- */
class TrackerCache {
  private trackers = new Map<number, Set<string>>();
  private trackerDetails = new Map<number, TrackerInfo[]>();

  getTrackers(tabId: number): Set<string> {
    if (!this.trackers.has(tabId)) {
      this.trackers.set(tabId, new Set());
    }
    return this.trackers.get(tabId)!;
  }

  addTrackerDetail(tabId: number, tracker: TrackerInfo): void {
    if (!this.trackerDetails.has(tabId)) {
      this.trackerDetails.set(tabId, []);
    }
    this.trackerDetails.get(tabId)!.push(tracker);
  }

  getTrackerDetails(tabId: number): TrackerInfo[] {
    return this.trackerDetails.get(tabId) ?? [];
  }

  reset(tabId: number): void {
    this.trackers.delete(tabId);
  }
}

const cache = new TrackerCache();

/* ---- SIDE PANEL ---- */
chrome.sidePanel
  .setPanelBehavior({openPanelOnActionClick: true})
  .catch((error) => console.error(error));


/* ---- TAB UPDATE HANDLER ---- */
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading" && changeInfo.url) {
    cache.reset(tabId);
  }

  if (changeInfo.status !== "complete") return;

});

/* ---- NETWORK REQUEST HANDLER ---- */
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const tabId = details.tabId;
    if (tabId < 0 || details.url.includes("chrome-extension://")) return;

    handleNetworkRequests({
      details,
      trackersCache: cache.getTrackers(tabId),
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
  cache.reset(tabId);
});