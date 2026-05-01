/// <reference types="chrome" />

import { calculateCookieRiskScore } from "@/utils/scoring/cookie-risk-score";
import { calculateDsgvoRiskScore } from "@/utils/scoring/dsgvo-risk-score";
import { calculateTrackerRiskPageScore } from "@/utils/scoring/network-risk-score";
import { calculateOverallRiskScore } from "@/utils/scoring/overall-risk-score";
import type { ClassifiedCookie } from "@/utils/types/cookie-types";
import type { DsgvoResult } from "@/utils/types/dsgvo-types";
import type { TrackerInfo } from "@/utils/types/tracking-enums";

/* ---- CACHE MANAGER ---- */
export class TrackerCache {
  private trackerDetails = new Map<number, Map<string, TrackerInfo>>();
  private cookieDetails = new Map<number, ClassifiedCookie[]>();
  private dsgvoResults = new Map<number, DsgvoResult>();
  private overallRiskScore = new Map<number, number>();
  private timestamps = new Map<number, number>();
  private persistDebounceTimers = new Map<number, ReturnType<typeof setTimeout>>();

  setTrackerDetail(tabId: number, tracker: TrackerInfo): void {
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

  setCookies(tabId: number, cookies: ClassifiedCookie[]): void {
    this.cookieDetails.set(tabId, cookies);
    this.updateTimestamp(tabId);
    this.debouncedPersist(tabId);
  }

  getCookieDetails(tabId: number): ClassifiedCookie[] {
    return this.cookieDetails.get(tabId) ?? [];
  }

  setDsgvoResult(tabId: number, result: DsgvoResult): void {
    this.dsgvoResults.set(tabId, result);
    this.debouncedPersist(tabId);
  }

  getDsgvoResult(tabId: number): DsgvoResult | null {
    return this.dsgvoResults.get(tabId) ?? null;
  }

  setOverallRiskScore(tabId: number, score: number): void {
    this.overallRiskScore.set(tabId, score);
  }

  getOverallRiskScore(tabId: number): number {
    return this.overallRiskScore.get(tabId) ?? 0;
  }

  recalculateOverallRiskScore(tabId: number): number {
    const trackerScore = calculateTrackerRiskPageScore(this.getTrackerDetails(tabId));
    const cookieScore = calculateCookieRiskScore(this.getCookieDetails(tabId));
    const dsgvoScore = calculateDsgvoRiskScore(this.getDsgvoResult(tabId));
    const score = calculateOverallRiskScore(trackerScore, cookieScore, dsgvoScore);
    this.overallRiskScore.set(tabId, score);
    return score;
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
      [`dsgvoResults${tabId}`]: this.dsgvoResults.get(tabId) ?? [],
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
      `dsgvoResults_${tabId}`,
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

    const dsgvoResults = result[`dsgvoResults_${tabId}`];
    if (Array.isArray(dsgvoResults)) {
      this.dsgvoResults.set(tabId, result as DsgvoResult);
    }

    const ts = result[`timestamp_${tabId}`];
    if (typeof ts === "number") {
      this.timestamps.set(tabId, ts);
    }
  }

  reset(tabId: number): void {
    this.trackerDetails.delete(tabId);
    this.cookieDetails.delete(tabId);
    this.dsgvoResults.delete(tabId);
    this.timestamps.delete(tabId);
  }

  clear(tabId: number): void {
    this.reset(tabId);
    chrome.storage.session.remove([
      `trackerDetails_${tabId}`,
      `cookieDetails_${tabId}`,
      `dsgvoResults_${tabId}`,
      `timestamp_${tabId}`,
    ]);
  }
}
