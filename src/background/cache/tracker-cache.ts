/// <reference types="chrome" />

import { calculateCookieRiskScore } from "@/utils/scoring/cookie-risk-score";
import { calculateDsgvoRiskScore } from "@/utils/scoring/dsgvo-risk-score";
import { calculateTrackerRiskPageScore } from "@/utils/scoring/network-risk-score";
import { calculateOverallRiskScore } from "@/utils/scoring/overall-risk-score";
import type { ClassifiedCookie } from "@/utils/types/cookie-types";
import type { ConsentTimingResult, ContentScriptDsgvoResult, CookieViolation, DsgvoResult } from "@/utils/types/dsgvo-types";
import type { TrackerInfo } from "@/utils/types/tracking-enums";

/* ---- CACHE MANAGER ---- */
export class TrackerCache {
  private trackerDetails = new Map<number, Map<string, TrackerInfo>>();
  private cookieDetails = new Map<number, ClassifiedCookie[]>();
  private dsgvoResults = new Map<number, DsgvoResult>();
  private contentResults = new Map<number, ContentScriptDsgvoResult>();
  private overallRiskScore = new Map<number, number>();
  private timestamps = new Map<number, number>();
  private consentTiming = new Map<number, ConsentTimingResult>();
  private scanCompleted = new Map<number, boolean>();
  private scanStartedAt = new Map<number, number>();
  private scanDuration = new Map<number, number>();
  private persistDebounceTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private uiUpdateDebounceTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private uiUpdateCallback: ((tabId: number) => void) | null = null;
  private readonly STALE_THRESHOLD_MS = 30 * 60 * 1000;

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
    this.scanCompleted.set(tabId, true);
    this.updateTimestamp(tabId);
    this.debouncedPersist(tabId);
  }

  getScanDuration(tabId: number): number | null {
    return this.scanDuration.get(tabId) ?? null;
  }

  isScanCompleted(tabId: number): boolean {
    return this.scanCompleted.get(tabId) ?? false;
  }

  isDataStale(tabId: number): boolean {
    const ts = this.timestamps.get(tabId);
    if (ts == null) return true;
    return Date.now() - ts > this.STALE_THRESHOLD_MS;
  }

  invalidateScan(tabId: number): void {
    this.scanCompleted.set(tabId, false);
  }

  startScan(tabId: number): void {
    this.scanStartedAt.set(tabId, Date.now());
    this.scanDuration.delete(tabId);
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

  setContentResult(tabId: number, result: ContentScriptDsgvoResult): void {
    this.contentResults.set(tabId, result);
    this.debouncedPersist(tabId);
  }

  getContentResult(tabId: number): ContentScriptDsgvoResult | null {
    return this.contentResults.get(tabId) ?? null;
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
    this.debouncedPersist(tabId);
    return score;
  }

  setConsentTimingBannerShown(tabId: number): void {
    const existing = this.consentTiming.get(tabId);
    if (existing?.bannerShownAt != null) return;
    this.consentTiming.set(tabId, {
      bannerShownAt: Date.now(),
      interactedAt: null,
      cookiesSetBeforeConsent: [],
      cookiesSetAfterConsent: [],
    });
    this.debouncedPersist(tabId);
  }

  async setConsentTimingInteracted(tabId: number, onInteracted: () => Promise<void>): Promise<void> {
    const existing = this.consentTiming.get(tabId);
    if (existing == null) return;
    this.consentTiming.set(tabId, { ...existing, interactedAt: Date.now() });
    this.debouncedPersist(tabId);
    await onInteracted();
  }

  addCookieViolation(tabId: number, violation: CookieViolation, tabDomain: string): void {
    const existing = this.consentTiming.get(tabId);
    if (existing == null) return;

    const isAfterConsent = existing.interactedAt != null;
    if (isAfterConsent && !violation.domain.includes(tabDomain)) return;

    const list = existing.interactedAt == null
      ? existing.cookiesSetBeforeConsent
      : existing.cookiesSetAfterConsent;

    const alreadyTracked = list.some(
      (v) => v.name === violation.name && v.domain === violation.domain
    );
    if (alreadyTracked) return;

    list.push(violation);
    this.debouncedPersist(tabId);
  }

  getConsentTiming(tabId: number): ConsentTimingResult | null {
    return this.consentTiming.get(tabId) ?? null;
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
      [`trackerDetails_${tabId}`]: Array.from(this.trackerDetails.get(tabId)?.values() ?? []),
      [`cookieDetails_${tabId}`]: this.cookieDetails.get(tabId) ?? [],
      [`dsgvoResult_${tabId}`]: this.dsgvoResults.get(tabId) ?? null,
      [`contentResult_${tabId}`]: this.contentResults.get(tabId) ?? null,
      [`consentTiming_${tabId}`]: this.consentTiming.get(tabId) ?? null,
      [`overallRiskScore_${tabId}`]: this.overallRiskScore.get(tabId) ?? null,
      [`scanCompleted_${tabId}`]: this.scanCompleted.get(tabId) ?? false,
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

  setUIUpdateCallback(callback: (tabId: number) => void): void {
    this.uiUpdateCallback = callback;
  }

  scheduleUIUpdate(tabId: number): void {
    const existing = this.uiUpdateDebounceTimers.get(tabId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      const start = this.scanStartedAt.get(tabId);
      // TODO: remove later
      console.log(`[ScanDuration] debounce fired tabId=${tabId}, start=${start}, hasDuration=${this.scanDuration.has(tabId)}`);
      if (start != null && !this.scanDuration.has(tabId)) {
        const duration = Math.round((Date.now() - start) / 100) / 10;
        this.scanDuration.set(tabId, duration);
        // TODO: remove later
        console.log(`[ScanDuration] tabId=${tabId} duration=${duration}s`);
      }
      this.recalculateOverallRiskScore(tabId);
      this.uiUpdateCallback?.(tabId);
      this.uiUpdateDebounceTimers.delete(tabId);
    }, 300);
    this.uiUpdateDebounceTimers.set(tabId, timer);
  }

  async restoreFromStorage(tabId: number): Promise<void> {
    const result = await chrome.storage.session.get([
      `trackerDetails_${tabId}`,
      `cookieDetails_${tabId}`,
      `dsgvoResult_${tabId}`,
      `contentResult_${tabId}`,
      `consentTiming_${tabId}`,
      `timestamp_${tabId}`,
      `overallRiskScore_${tabId}`,
      `scanCompleted_${tabId}`,
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

    const dsgvoResult = result[`dsgvoResult_${tabId}`];
    if (dsgvoResult != null && typeof dsgvoResult === "object" && !Array.isArray(dsgvoResult)) {
      this.dsgvoResults.set(tabId, dsgvoResult as DsgvoResult);
    }

    const contentResult = result[`contentResult_${tabId}`];
    if (contentResult != null && typeof contentResult === "object" && !Array.isArray(contentResult)) {
      this.contentResults.set(tabId, contentResult as ContentScriptDsgvoResult);
    }

    const consentTiming = result[`consentTiming_${tabId}`];
    if (consentTiming != null && typeof consentTiming === "object" && !Array.isArray(consentTiming)) {
      this.consentTiming.set(tabId, consentTiming as ConsentTimingResult);
    }

    const ts = result[`timestamp_${tabId}`];
    if (typeof ts === "number") {
      this.timestamps.set(tabId, ts);
    }

    // Restore stored score as backup (map = primary, storage = fallback)
    const storedScore = result[`overallRiskScore_${tabId}`];
    if (typeof storedScore === "number") {
      this.overallRiskScore.set(tabId, storedScore);
    }

    const scanCompleted = result[`scanCompleted_${tabId}`];
    if (typeof scanCompleted === "boolean") {
      this.scanCompleted.set(tabId, scanCompleted);
    }

    // Recalculate from sub-data if available, overrides stored score
    if (this.trackerDetails.has(tabId) || this.cookieDetails.has(tabId) || this.dsgvoResults.has(tabId)) {
      this.recalculateOverallRiskScore(tabId);
    }
  }

  reset(tabId: number): void {
    this.trackerDetails.delete(tabId);
    this.cookieDetails.delete(tabId);
    this.dsgvoResults.delete(tabId);
    this.contentResults.delete(tabId);
    this.consentTiming.delete(tabId);
    this.overallRiskScore.delete(tabId);
    this.timestamps.delete(tabId);
    this.scanCompleted.delete(tabId);
    this.scanStartedAt.delete(tabId);
    this.scanDuration.delete(tabId);
  }

  clear(tabId: number): void {
    this.reset(tabId);
    chrome.storage.session.remove([
      `trackerDetails_${tabId}`,
      `cookieDetails_${tabId}`,
      `dsgvoResult_${tabId}`,
      `contentResult_${tabId}`,
      `consentTiming_${tabId}`,
      `timestamp_${tabId}`,
      `overallRiskScore_${tabId}`,
      `scanCompleted_${tabId}`,
    ]);
  }
}
