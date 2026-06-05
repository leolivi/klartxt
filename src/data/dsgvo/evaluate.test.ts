import { describe, it, expect } from "vitest";
import { evaluateArt7, evaluateArt13_14, evaluateArt25, confirmedTrackers } from "./evaluate";
import { CheckSeverity, type ConsentTimingResult, type ContentScriptDsgvoResult } from "@/utils/types/dsgvo-types";
import { TrackerCategory, TrackerCategoryForUser, TrackerConfidence, type TrackerInfo } from "@/utils/types/tracking-enums";

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

const noConsentTiming = null;

const bannerVisible: ContentScriptDsgvoResult["art7"] = { bannerVisible: true, cookieCount: 0 };
const bannerHidden: ContentScriptDsgvoResult["art7"] = { bannerVisible: false, cookieCount: 0 };

describe("confirmedTrackers", () => {
  it("returns only CONFIRMED trackers", () => {
    const suspicious = makeTracker({ confidence: TrackerConfidence.SUSPICIOUS });
    const confirmed = makeTracker({ confidence: TrackerConfidence.CONFIRMED });
    expect(confirmedTrackers([suspicious, confirmed])).toHaveLength(1);
    expect(confirmedTrackers([suspicious, confirmed])[0]).toBe(confirmed);
  });

  it("excludes consent management tools even if CONFIRMED", () => {
    const consentTool = makeTracker({
      confidence: TrackerConfidence.CONFIRMED,
      detailedCategories: [TrackerCategory.CONSENT],
    });
    expect(confirmedTrackers([consentTool])).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    expect(confirmedTrackers([])).toHaveLength(0);
  });
});

describe("evaluateArt7", () => {
  it("returns CONFIRMED when cookies were set before consent", () => {
    const consentTiming: ConsentTimingResult = {
      bannerShownAt: 1000,
      interactedAt: 2000,
      cookiesSetBeforeConsent: [{ name: "_ga", domain: "google.com", setAt: 500 }],
      cookiesSetAfterConsent: [],
    };
    const result = evaluateArt7(bannerVisible, [], 1, consentTiming);
    expect(result.severity).toBe(CheckSeverity.CONFIRMED);
    expect(result.passed).toBe(false);
    expect(result.consentViolations).toHaveLength(1);
  });

  it("returns SUSPICIOUS when banner is visible and trackers are active", () => {
    const tracker = makeTracker({ confidence: TrackerConfidence.CONFIRMED });
    const result = evaluateArt7(bannerVisible, [tracker], 0, noConsentTiming);
    expect(result.severity).toBe(CheckSeverity.SUSPICIOUS);
    expect(result.passed).toBe(false);
  });

  it("returns SUSPICIOUS when banner is visible and cookies are present", () => {
    const result = evaluateArt7({ bannerVisible: true, cookieCount: 3 }, [], 3, noConsentTiming);
    expect(result.severity).toBe(CheckSeverity.SUSPICIOUS);
    expect(result.passed).toBe(false);
  });

  it("returns FINE when no banner and no cookies or trackers", () => {
    const result = evaluateArt7(bannerHidden, [], 0, noConsentTiming);
    expect(result.severity).toBe(CheckSeverity.FINE);
    expect(result.passed).toBe(true);
  });

  it("returns FINE when consentTiming has no bannerShownAt even with violations array", () => {
    // bannerShownAt is null so the CONFIRMED branch is not entered
    const consentTiming: ConsentTimingResult = {
      bannerShownAt: null,
      interactedAt: null,
      cookiesSetBeforeConsent: [{ name: "_ga", domain: "google.com", setAt: 500 }],
      cookiesSetAfterConsent: [],
    };
    const result = evaluateArt7(bannerHidden, [], 0, consentTiming);
    expect(result.severity).toBe(CheckSeverity.FINE);
  });
});

describe("evaluateArt13_14", () => {
  it("returns FINE when privacy policy is found", () => {
    const result = evaluateArt13_14(true, ["footer", "nav"]);
    expect(result.severity).toBe(CheckSeverity.FINE);
    expect(result.passed).toBe(true);
    expect(result.privacyPolicyFound).toBe(true);
    expect(result.searchedLocations).toEqual(["footer", "nav"]);
  });

  it("returns CONFIRMED when no privacy policy is found", () => {
    const result = evaluateArt13_14(false, ["footer", "nav"]);
    expect(result.severity).toBe(CheckSeverity.CONFIRMED);
    expect(result.passed).toBe(false);
    expect(result.privacyPolicyFound).toBe(false);
  });

  it("includes searched locations in evidence", () => {
    const locations = ["footer", "header", "sidebar"];
    const result = evaluateArt13_14(false, locations);
    expect(result.evidence.some(e => e.includes("footer"))).toBe(true);
  });
});

describe("evaluateArt25", () => {
  it("returns CONFIRMED when connection is not HTTPS", () => {
    const result = evaluateArt25(false, [], false);
    expect(result.severity).toBe(CheckSeverity.CONFIRMED);
    expect(result.passed).toBe(false);
    expect(result.isHttps).toBe(false);
  });

  it("returns CONFIRMED when high-risk trackers are present (riskScore > 30)", () => {
    const highRisk = makeTracker({ riskScore: 70, confidence: TrackerConfidence.CONFIRMED });
    const result = evaluateArt25(true, [highRisk], false);
    expect(result.severity).toBe(CheckSeverity.CONFIRMED);
    expect(result.passed).toBe(false);
    expect(result.highRiskTrackerCount).toBe(1);
    expect(result.highRiskTrackers).toContain("tracker.example.com");
  });

  it("returns SUSPICIOUS when low-risk confirmed trackers exist", () => {
    // riskScore=25 ≤ 30, so not high-risk but still a confirmed tracker
    const lowRisk = makeTracker({ riskScore: 25, confidence: TrackerConfidence.CONFIRMED });
    const result = evaluateArt25(true, [lowRisk], false);
    expect(result.severity).toBe(CheckSeverity.SUSPICIOUS);
    expect(result.passed).toBe(true);
    expect(result.highRiskTrackerCount).toBe(0);
  });

  it("returns SUSPICIOUS when DOM fingerprinting is detected", () => {
    const result = evaluateArt25(true, [], true);
    expect(result.severity).toBe(CheckSeverity.SUSPICIOUS);
    expect(result.fingerprintingDetected).toBe(true);
  });

  it("detects network-level fingerprinting (DDG score >= 2)", () => {
    const fingerprintingTracker = makeTracker({ fingerprintingScore: 2, riskScore: 25 });
    const result = evaluateArt25(true, [fingerprintingTracker], false);
    expect(result.severity).toBe(CheckSeverity.SUSPICIOUS);
    expect(result.fingerprintingDetected).toBe(true);
  });

  it("returns FINE when HTTPS and no risks detected", () => {
    const result = evaluateArt25(true, [], false);
    expect(result.severity).toBe(CheckSeverity.FINE);
    expect(result.passed).toBe(true);
    expect(result.highRiskTrackerCount).toBe(0);
  });

  it("excludes consent tools from high-risk detection", () => {
    const consentTracker = makeTracker({
      riskScore: 100,
      confidence: TrackerConfidence.CONFIRMED,
      detailedCategories: [TrackerCategory.CONSENT],
    });
    const result = evaluateArt25(true, [consentTracker], false);
    // consent tool is excluded from confirmedTrackers, so no high risk
    expect(result.severity).toBe(CheckSeverity.FINE);
  });
});
