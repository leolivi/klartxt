import { describe, it, expect } from "vitest";
import { inferInsights, maxSeverity, type Insight } from "./insights";
import { TrackerCategory, TrackerCategoryForUser, TrackerConfidence, type TrackerInfo } from "./types/tracking-enums";
import { CookieCategory, CookieCategoryForUser, type ClassifiedCookie } from "./types/cookie-types";
import { Articles, CheckSeverity, type DsgvoResult } from "./types/dsgvo-types";

function makeTracker(overrides: Partial<TrackerInfo> = {}): TrackerInfo {
  return {
    domain: "tracker.example.com",
    owner: null,
    userCategory: TrackerCategoryForUser.TRACKING,
    detailedCategories: [TrackerCategory.ANALYTICS],
    riskScore: 50,
    confidence: TrackerConfidence.CONFIRMED,
    fingerprintingScore: 0,
    ...overrides,
  };
}

function makeCookie(overrides: Partial<ClassifiedCookie> = {}): ClassifiedCookie {
  return {
    name: "test_cookie",
    domain: "example.com",
    category: CookieCategory.NECESSARY,
    userCategory: CookieCategoryForUser.NECESSARY,
    isThirdParty: false,
    httpOnly: true,
    secure: true,
    ...overrides,
  };
}

const baseCheck = {
  article: Articles.ART7,
  title: "",
  quickTitle: "",
  explanation: "",
  recommendation: "",
  evidence: [],
};

function makeDsgvoResult(overrides: {
  art7Passed?: boolean;
  art7Severity?: CheckSeverity;
  art7Violations?: { name: string; domain: string; setAt: number }[];
  art25Passed?: boolean;
  art25Severity?: CheckSeverity;
  art25Fingerprinting?: boolean;
  art25HighRiskCount?: number;
  art1314Passed?: boolean;
  art1314Severity?: CheckSeverity;
} = {}): DsgvoResult {
  return {
    art7: {
      ...baseCheck,
      article: Articles.ART7,
      severity: overrides.art7Severity ?? CheckSeverity.FINE,
      passed: overrides.art7Passed ?? true,
      consentViolations: overrides.art7Violations ?? [],
      cookiesAfterConsent: [],
    },
    art13_14: {
      ...baseCheck,
      article: Articles.ART1314,
      severity: overrides.art1314Severity ?? CheckSeverity.FINE,
      passed: overrides.art1314Passed ?? true,
      privacyPolicyFound: overrides.art1314Passed ?? true,
      searchedLocations: [],
    },
    art25: {
      ...baseCheck,
      article: Articles.ART25,
      severity: overrides.art25Severity ?? CheckSeverity.FINE,
      passed: overrides.art25Passed ?? true,
      highRiskTrackerCount: overrides.art25HighRiskCount ?? 0,
      isHttps: true,
      highRiskTrackers: [],
      fingerprintingDetected: overrides.art25Fingerprinting ?? false,
    },
    checkedAt: Date.now(),
  };
}

describe("inferInsights, tracker", () => {
  it("returns fine insight when no trackers", () => {
    const [, tracker] = inferInsights([], [], null);
    expect(tracker.severity).toBe("fine");
    expect(tracker.textKey).toBe("insightTracker_none");
  });

  it("returns confirmed insight with company names when ads trackers with owners exist", () => {
    const trackers = [
      makeTracker({ userCategory: TrackerCategoryForUser.ADS, owner: "Google LLC" }),
    ];
    const [, tracker] = inferInsights(trackers, [], null);
    expect(tracker.severity).toBe("confirmed");
    expect(tracker.textKey).toBe("insightTracker_ads_companies");
    expect(tracker.vars?.companies).toContain("Google LLC");
  });

  it("returns confirmed insight without company names when ads trackers have no owner", () => {
    const trackers = [makeTracker({ userCategory: TrackerCategoryForUser.ADS, owner: null })];
    const [, tracker] = inferInsights(trackers, [], null);
    expect(tracker.severity).toBe("confirmed");
    expect(tracker.textKey).toBe("insightTracker_ads");
  });

  it("returns suspicious insight for non-ads trackers", () => {
    const trackers = [makeTracker({ userCategory: TrackerCategoryForUser.TRACKING })];
    const [, tracker] = inferInsights(trackers, [], null);
    expect(tracker.severity).toBe("suspicious");
    expect(tracker.textKey).toBe("insightTracker_other");
    expect(tracker.vars?.count).toBe(1);
  });
});

describe("inferInsights, cookie", () => {
  it("returns fine insight when no cookies", () => {
    const [, , cookie] = inferInsights([], [], null);
    expect(cookie.severity).toBe("fine");
    expect(cookie.textKey).toBe("insightCookie_none");
  });

  it("returns confirmed insight when tracking cookies are present", () => {
    const cookies = [makeCookie({ userCategory: CookieCategoryForUser.TRACKING })];
    const [, , cookie] = inferInsights([], cookies, null);
    expect(cookie.severity).toBe("confirmed");
    expect(cookie.textKey).toBe("insightCookie_tracking");
    expect(cookie.vars?.count).toBe(1);
  });

  it("returns fine insight when only necessary cookies are present", () => {
    const cookies = [makeCookie({ userCategory: CookieCategoryForUser.NECESSARY })];
    const [, , cookie] = inferInsights([], cookies, null);
    expect(cookie.severity).toBe("fine");
    expect(cookie.textKey).toBe("insightCookie_necessary");
  });
});

describe("inferInsights, dsgvo", () => {
  it("returns fine insight when dsgvoResult is null", () => {
    const [dsgvo] = inferInsights([], [], null);
    expect(dsgvo.severity).toBe("fine");
    expect(dsgvo.textKey).toBe("insightDsgvo_noData");
  });

  it("returns confirmed insight for art7 violations", () => {
    const result = makeDsgvoResult({
      art7Passed: false,
      art7Severity: CheckSeverity.CONFIRMED,
      art7Violations: [{ name: "_ga", domain: "google.com", setAt: 500 }],
    });
    const [dsgvo] = inferInsights([], [], result);
    expect(dsgvo.severity).toBe("confirmed");
    expect(dsgvo.textKey).toBe("insightDsgvo_art7_violations");
  });

  it("returns suspicious insight for art7 failure without violations", () => {
    const result = makeDsgvoResult({ art7Passed: false, art7Severity: CheckSeverity.SUSPICIOUS });
    const [dsgvo] = inferInsights([], [], result);
    expect(dsgvo.severity).toBe("suspicious");
    expect(dsgvo.textKey).toBe("insightDsgvo_art7_suspicious");
  });

  it("returns suspicious insight when art25 has fingerprinting", () => {
    const result = makeDsgvoResult({
      art25Passed: false,
      art25Severity: CheckSeverity.SUSPICIOUS,
      art25Fingerprinting: true,
    });
    const [dsgvo] = inferInsights([], [], result);
    expect(dsgvo.severity).toBe("suspicious");
    expect(dsgvo.textKey).toBe("insightDsgvo_art25_fingerprinting");
  });

  it("returns confirmed insight when art25 has high-risk trackers", () => {
    const result = makeDsgvoResult({
      art25Passed: false,
      art25Severity: CheckSeverity.CONFIRMED,
      art25Fingerprinting: false,
      art25HighRiskCount: 3,
    });
    const [dsgvo] = inferInsights([], [], result);
    expect(dsgvo.severity).toBe("confirmed");
    expect(dsgvo.textKey).toBe("insightDsgvo_art25_highRisk");
  });

  it("returns fine insight when all dsgvo checks pass", () => {
    const result = makeDsgvoResult();
    const [dsgvo] = inferInsights([], [], result);
    expect(dsgvo.severity).toBe("fine");
    expect(dsgvo.textKey).toBe("insightDsgvo_fine");
  });
});

describe("inferInsights, profiling", () => {
  it("returns confirmed insight when session replay tracker is present", () => {
    const trackers = [makeTracker({ detailedCategories: [TrackerCategory.SESSION], userCategory: TrackerCategoryForUser.SESSION })];
    const [, , , profiling] = inferInsights(trackers, [], null);
    expect(profiling.severity).toBe("confirmed");
    expect(profiling.textKey).toBe("insightProfiling_sessionReplay");
  });

  it("returns suspicious insight when ads and social trackers are present", () => {
    const trackers = [
      makeTracker({ detailedCategories: [TrackerCategory.AD] }),
      makeTracker({ detailedCategories: [TrackerCategory.SOCIAL] }),
    ];
    const [, , , profiling] = inferInsights(trackers, [], null);
    expect(profiling.severity).toBe("suspicious");
    expect(profiling.textKey).toBe("insightProfiling_crossContext");
  });

  it("returns suspicious insight when analytics and social trackers are present", () => {
    const trackers = [
      makeTracker({ detailedCategories: [TrackerCategory.ANALYTICS] }),
      makeTracker({ detailedCategories: [TrackerCategory.SOCIAL] }),
    ];
    const [, , , profiling] = inferInsights(trackers, [], null);
    expect(profiling.severity).toBe("suspicious");
    expect(profiling.textKey).toBe("insightProfiling_crossContext");
  });

  it("returns suspicious insight when fingerprintingDetected is true", () => {
    const [, , , profiling] = inferInsights([], [], makeDsgvoResult({ art25Fingerprinting: true, art25Passed: false, art25Severity: CheckSeverity.SUSPICIOUS }));
    expect(profiling.severity).toBe("suspicious");
    expect(profiling.textKey).toBe("insightProfiling_fingerprinting");
  });

  it("session replay takes priority over fingerprinting", () => {
    const trackers = [makeTracker({ detailedCategories: [TrackerCategory.SESSION], userCategory: TrackerCategoryForUser.SESSION })];
    const [, , , profiling] = inferInsights(trackers, [], makeDsgvoResult({ art25Fingerprinting: true, art25Passed: false, art25Severity: CheckSeverity.SUSPICIOUS }));
    expect(profiling.textKey).toBe("insightProfiling_sessionReplay");
  });

  it("returns fine insight when no profiling signals are present", () => {
    const [, , , profiling] = inferInsights([], [], null);
    expect(profiling.severity).toBe("fine");
    expect(profiling.textKey).toBe("insightProfiling_none");
  });

  it("returns fine when ads exist but no social", () => {
    const trackers = [makeTracker({ detailedCategories: [TrackerCategory.AD] })];
    const [, , , profiling] = inferInsights(trackers, [], null);
    expect(profiling.severity).toBe("fine");
  });
});

describe("inferInsights, returns 4 insights in correct order", () => {
  it("always returns exactly 4 insights: [dsgvo, tracker, cookie, profiling]", () => {
    const insights = inferInsights([], [], null);
    expect(insights).toHaveLength(4);
    expect(insights[0].type).toBe("dsgvo");
    expect(insights[1].type).toBe("tracker");
    expect(insights[2].type).toBe("cookie");
    expect(insights[3].type).toBe("profiling");
  });
});

describe("maxSeverity", () => {
  it("returns fine when all insights are fine", () => {
    const insights: Insight[] = [
      { type: "tracker", severity: "fine", textKey: "a" },
      { type: "cookie", severity: "fine", textKey: "b" },
    ];
    expect(maxSeverity(insights)).toBe("fine");
  });

  it("returns suspicious when at least one is suspicious", () => {
    const insights: Insight[] = [
      { type: "tracker", severity: "fine", textKey: "a" },
      { type: "cookie", severity: "suspicious", textKey: "b" },
    ];
    expect(maxSeverity(insights)).toBe("suspicious");
  });

  it("returns confirmed when at least one is confirmed", () => {
    const insights: Insight[] = [
      { type: "tracker", severity: "fine", textKey: "a" },
      { type: "cookie", severity: "suspicious", textKey: "b" },
      { type: "dsgvo", severity: "confirmed", textKey: "c" },
    ];
    expect(maxSeverity(insights)).toBe("confirmed");
  });

  it("returns fine for empty array", () => {
    expect(maxSeverity([])).toBe("fine");
  });
});
