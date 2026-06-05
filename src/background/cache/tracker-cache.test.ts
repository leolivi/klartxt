import { vi, describe, it, expect, beforeEach } from "vitest";
import { TrackerCache } from "./tracker-cache";
import { TrackerCategory, TrackerCategoryForUser, TrackerConfidence, type TrackerInfo } from "@/utils/types/tracking-enums";
import { CookieCategory, CookieCategoryForUser, type ClassifiedCookie } from "@/utils/types/cookie-types";
import { Articles, CheckSeverity, type DsgvoResult } from "@/utils/types/dsgvo-types";

// TrackerCache uses chrome.storage inside debounced setTimeout calls.
// Stubbing prevents errors if timers fire after the test ends.
vi.stubGlobal("chrome", {
  storage: {
    session: {
      set: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue({}),
      remove: vi.fn().mockResolvedValue(undefined),
    },
  },
});

const TAB = 1;

function makeTracker(domain: string, overrides: Partial<TrackerInfo> = {}): TrackerInfo {
  return {
    domain,
    owner: null,
    userCategory: TrackerCategoryForUser.TRACKING,
    detailedCategories: [TrackerCategory.ANALYTICS],
    riskScore: 50,
    confidence: TrackerConfidence.CONFIRMED,
    fingerprintingScore: 0,
    ...overrides,
  };
}

function makeCookie(name: string, overrides: Partial<ClassifiedCookie> = {}): ClassifiedCookie {
  return {
    name,
    domain: "example.com",
    category: CookieCategory.ANALYTICS,
    userCategory: CookieCategoryForUser.TRACKING,
    isThirdParty: false,
    httpOnly: false,
    secure: true,
    ...overrides,
  };
}

const baseDsgvo: DsgvoResult = {
  art7: {
    passed: true, severity: CheckSeverity.FINE, article: Articles.ART7,
    title: "", quickTitle: "", explanation: "", recommendation: "", evidence: [],
    consentViolations: [], cookiesAfterConsent: [],
  },
  art13_14: {
    passed: true, severity: CheckSeverity.FINE, article: Articles.ART1314,
    title: "", quickTitle: "", explanation: "", recommendation: "", evidence: [],
    privacyPolicyFound: true, searchedLocations: [],
  },
  art25: {
    passed: true, severity: CheckSeverity.FINE, article: Articles.ART25,
    title: "", quickTitle: "", explanation: "", recommendation: "", evidence: [],
    highRiskTrackerCount: 0, isHttps: true, highRiskTrackers: [], fingerprintingDetected: false,
  },
  checkedAt: Date.now(),
};

let cache: TrackerCache;

beforeEach(() => {
  cache = new TrackerCache();
});

describe("tracker details", () => {
  it("returns empty array for unknown tab", () => {
    expect(cache.getTrackerDetails(TAB)).toEqual([]);
  });

  it("stores and retrieves a tracker", () => {
    const t = makeTracker("analytics.example.com");
    cache.setTrackerDetail(TAB, t);
    expect(cache.getTrackerDetails(TAB)).toHaveLength(1);
    expect(cache.getTrackerDetails(TAB)[0].domain).toBe("analytics.example.com");
  });

  it("ignores duplicate domains (deduplication)", () => {
    const t = makeTracker("analytics.example.com");
    cache.setTrackerDetail(TAB, t);
    cache.setTrackerDetail(TAB, t); // second call with same domain
    expect(cache.getTrackerDetails(TAB)).toHaveLength(1);
  });

  it("stores trackers from different domains separately", () => {
    cache.setTrackerDetail(TAB, makeTracker("a.example.com"));
    cache.setTrackerDetail(TAB, makeTracker("b.example.com"));
    expect(cache.getTrackerDetails(TAB)).toHaveLength(2);
  });

  it("isolates trackers between tabs", () => {
    cache.setTrackerDetail(TAB, makeTracker("a.example.com"));
    expect(cache.getTrackerDetails(TAB + 1)).toHaveLength(0);
  });
});

describe("cookie details", () => {
  it("returns empty array for unknown tab", () => {
    expect(cache.getCookieDetails(TAB)).toEqual([]);
  });

  it("stores and retrieves cookies", () => {
    const cookies = [makeCookie("_ga"), makeCookie("_fbp")];
    cache.setCookies(TAB, cookies);
    expect(cache.getCookieDetails(TAB)).toHaveLength(2);
  });

  it("replaces cookies on subsequent set", () => {
    cache.setCookies(TAB, [makeCookie("_ga"), makeCookie("_fbp")]);
    cache.setCookies(TAB, [makeCookie("_ga")]);
    expect(cache.getCookieDetails(TAB)).toHaveLength(1);
  });
});

describe("scan state", () => {
  it("is not completed by default", () => {
    expect(cache.isScanCompleted(TAB)).toBe(false);
  });

  it("marks scan as completed when cookies are set", () => {
    cache.setCookies(TAB, []);
    expect(cache.isScanCompleted(TAB)).toBe(true);
  });

  it("invalidateScan resets completion state", () => {
    cache.setCookies(TAB, []);
    cache.invalidateScan(TAB);
    expect(cache.isScanCompleted(TAB)).toBe(false);
  });

  it("getScanDuration returns null before scheduleUIUpdate fires", () => {
    cache.startScan(TAB);
    expect(cache.getScanDuration(TAB)).toBeNull();
  });
});

describe("isDataStale", () => {
  it("returns true when no data has been stored for the tab", () => {
    expect(cache.isDataStale(TAB)).toBe(true);
  });

  it("returns false immediately after storing data", () => {
    cache.setTrackerDetail(TAB, makeTracker("a.example.com"));
    expect(cache.isDataStale(TAB)).toBe(false);
  });

  it("returns true after the stale threshold (30 min) has passed", () => {
    cache.setTrackerDetail(TAB, makeTracker("a.example.com"));
    // Advance Date.now by 31 minutes
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    expect(cache.isDataStale(TAB)).toBe(true);
    vi.useRealTimers();
  });
});

describe("dsgvo / content results", () => {
  it("returns null when no dsgvo result stored", () => {
    expect(cache.getDsgvoResult(TAB)).toBeNull();
  });

  it("stores and retrieves dsgvo result", () => {
    cache.setDsgvoResult(TAB, baseDsgvo);
    expect(cache.getDsgvoResult(TAB)).toBe(baseDsgvo);
  });

  it("returns null when no content result stored", () => {
    expect(cache.getContentResult(TAB)).toBeNull();
  });

  it("stores and retrieves content result", () => {
    const cr = { art7: { bannerVisible: true, cookieCount: 2 }, art13_14: { found: true, searchedLocations: [] }, art25: { isHttps: true, fingerprintingDetected: false } };
    cache.setContentResult(TAB, cr);
    expect(cache.getContentResult(TAB)).toBe(cr);
  });
});

describe("overall risk score", () => {
  it("returns 0 for unknown tab", () => {
    expect(cache.getOverallRiskScore(TAB)).toBe(0);
  });

  it("stores and retrieves risk score", () => {
    cache.setOverallRiskScore(TAB, 3);
    expect(cache.getOverallRiskScore(TAB)).toBe(3);
  });

  it("recalculates from current tracker/cookie/dsgvo data", () => {
    cache.setCookies(TAB, []);
    cache.setDsgvoResult(TAB, baseDsgvo);
    const score = cache.recalculateOverallRiskScore(TAB);
    expect(score).toBeGreaterThanOrEqual(1);
    expect(score).toBeLessThanOrEqual(5);
    expect(cache.getOverallRiskScore(TAB)).toBe(score);
  });
});

describe("consent timing", () => {
  it("returns null when no consent timing recorded", () => {
    expect(cache.getConsentTiming(TAB)).toBeNull();
  });

  it("records banner shown timestamp", () => {
    cache.setConsentTimingBannerShown(TAB);
    const ct = cache.getConsentTiming(TAB);
    expect(ct?.bannerShownAt).toBeTypeOf("number");
    expect(ct?.interactedAt).toBeNull();
  });

  it("is idempotent, second bannerShown call does not overwrite timestamp", () => {
    cache.setConsentTimingBannerShown(TAB);
    const first = cache.getConsentTiming(TAB)!.bannerShownAt;
    cache.setConsentTimingBannerShown(TAB);
    expect(cache.getConsentTiming(TAB)!.bannerShownAt).toBe(first);
  });

  it("addCookieViolation does nothing when no consent timing exists", () => {
    cache.addCookieViolation(TAB, { name: "_ga", domain: "google.com", setAt: 1000 }, "example.com");
    expect(cache.getConsentTiming(TAB)).toBeNull();
  });

  it("adds cookie to beforeConsent list when banner shown but not yet interacted", () => {
    cache.setConsentTimingBannerShown(TAB);
    cache.addCookieViolation(TAB, { name: "_ga", domain: "google.com", setAt: 1000 }, "example.com");
    const ct = cache.getConsentTiming(TAB)!;
    expect(ct.cookiesSetBeforeConsent).toHaveLength(1);
    expect(ct.cookiesSetAfterConsent).toHaveLength(0);
  });

  it("deduplicates violations with the same name and domain", () => {
    cache.setConsentTimingBannerShown(TAB);
    const v = { name: "_ga", domain: "google.com", setAt: 1000 };
    cache.addCookieViolation(TAB, v, "example.com");
    cache.addCookieViolation(TAB, v, "example.com");
    expect(cache.getConsentTiming(TAB)!.cookiesSetBeforeConsent).toHaveLength(1);
  });

  it("adds cookie to afterConsent list when already interacted, if domain matches tab", async () => {
    cache.setConsentTimingBannerShown(TAB);
    await cache.setConsentTimingInteracted(TAB, async () => {});
    cache.addCookieViolation(TAB, { name: "session", domain: "example.com", setAt: 2000 }, "example.com");
    const ct = cache.getConsentTiming(TAB)!;
    expect(ct.cookiesSetAfterConsent).toHaveLength(1);
  });

  it("ignores afterConsent violation from unrelated third-party domain", async () => {
    cache.setConsentTimingBannerShown(TAB);
    await cache.setConsentTimingInteracted(TAB, async () => {});
    // "google.com" does not include "example.com" → filtered out
    cache.addCookieViolation(TAB, { name: "_ga", domain: "google.com", setAt: 2000 }, "example.com");
    expect(cache.getConsentTiming(TAB)!.cookiesSetAfterConsent).toHaveLength(0);
  });
});

describe("reset", () => {
  it("clears all data for a tab", () => {
    cache.setTrackerDetail(TAB, makeTracker("a.example.com"));
    cache.setCookies(TAB, [makeCookie("_ga")]);
    cache.setDsgvoResult(TAB, baseDsgvo);
    cache.setOverallRiskScore(TAB, 4);
    cache.setConsentTimingBannerShown(TAB);

    cache.reset(TAB);

    expect(cache.getTrackerDetails(TAB)).toEqual([]);
    expect(cache.getCookieDetails(TAB)).toEqual([]);
    expect(cache.getDsgvoResult(TAB)).toBeNull();
    expect(cache.getOverallRiskScore(TAB)).toBe(0);
    expect(cache.isScanCompleted(TAB)).toBe(false);
    expect(cache.getConsentTiming(TAB)).toBeNull();
  });

  it("does not affect data for other tabs", () => {
    cache.setTrackerDetail(TAB, makeTracker("a.example.com"));
    cache.setTrackerDetail(TAB + 1, makeTracker("b.example.com"));

    cache.reset(TAB);

    expect(cache.getTrackerDetails(TAB + 1)).toHaveLength(1);
  });
});
