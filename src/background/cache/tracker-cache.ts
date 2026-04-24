/// <reference types="chrome" />

import type { TrackerInfo } from "@/data/trackers/tracking-domains";
import type { ClassifiedCookie } from "@/utils/types/cookie-types";

/* ---- CACHE MANAGER ---- */
export class TrackerCache {
  private trackerDetails = new Map<number, Map<string, TrackerInfo>>();
  private cookieDetails = new Map<number, ClassifiedCookie[]>();
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

  addCookies(tabId: number, cookies: ClassifiedCookie[]): void {
    this.cookieDetails.set(tabId, cookies);
    this.updateTimestamp(tabId);
    this.debouncedPersist(tabId);
  }

  getCookieDetails(tabId: number): ClassifiedCookie[] {
    return this.cookieDetails.get(tabId) ?? [];
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
      [`cookieDetails_${tabId}`]: this.cookieDetails.get(tabId) ?? [],
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
      `cookieDetails_${tabId}`,
      `timestamp_${tabId}`,
    ]);

    const trackers = result[`trackerDetails_${tabId}`];
    if (Array.isArray(trackers)) {
      const trackerMap = new Map<string, TrackerInfo>();
      (trackers as TrackerInfo[]).forEach((t) => trackerMap.set(t.domain, t));
      this.trackerDetails.set(tabId, trackerMap);
    }

    const cookies = result[`cookieDetails_${tabId}`];
    if (Array.isArray(cookies)) {
      this.cookieDetails.set(tabId, cookies as ClassifiedCookie[]);
    }

    const ts = result[`timestamp_${tabId}`];
    if (typeof ts === "number") {
      this.timestamps.set(tabId, ts);
    }
  }

  reset(tabId: number): void {
    this.trackerDetails.delete(tabId);
    this.cookieDetails.delete(tabId);
    this.timestamps.delete(tabId);
  }

  clear(tabId: number): void {
    this.reset(tabId);
    chrome.storage.session.remove([
      `trackerDetails_${tabId}`,
      `cookieDetails_${tabId}`,
      `timestamp_${tabId}`,
    ]);
  }
}
