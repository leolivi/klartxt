import { describe, expect, it } from "vitest"
import { inferRecommendations } from "./recommendations"
import {
  CookieCategory,
  CookieCategoryForUser,
  type ClassifiedCookie,
} from "./types/cookie-types"
import { Articles, SeverityLevel, type DsgvoResult } from "./types/dsgvo-types"
import {
  TrackerCategory,
  TrackerCategoryForUser,
  TrackerConfidence,
  type TrackerInfo,
} from "./types/tracking-enums"

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
  }
}

function makeCookie(
  overrides: Partial<ClassifiedCookie> = {},
): ClassifiedCookie {
  return {
    name: "test_cookie",
    domain: "example.com",
    category: CookieCategory.NECESSARY,
    userCategory: CookieCategoryForUser.NECESSARY,
    isThirdParty: false,
    httpOnly: true,
    secure: true,
    ...overrides,
  }
}

const baseCheck = {
  title: "",
  quickTitle: "",
  explanation: "",
  recommendation: "",
  evidence: [],
}

function makeDsgvoResult(
  overrides: {
    art7Passed?: boolean
    art7Violations?: { name: string; domain: string; setAt: number }[]
  } = {},
): DsgvoResult {
  return {
    art7: {
      ...baseCheck,
      article: Articles.ART7,
      severity:
        overrides.art7Passed === false
          ? SeverityLevel.CONFIRMED
          : SeverityLevel.FINE,
      passed: overrides.art7Passed ?? true,
      consentViolations: overrides.art7Violations ?? [],
      cookiesAfterConsent: [],
    },
    art13_14: {
      ...baseCheck,
      article: Articles.ART1314,
      severity: SeverityLevel.FINE,
      passed: true,
      privacyPolicyFound: true,
      searchedLocations: [],
    },
    art25: {
      ...baseCheck,
      article: Articles.ART25,
      severity: SeverityLevel.FINE,
      passed: true,
      highRiskTrackerCount: 0,
      isHttps: true,
      highRiskTrackers: [],
      fingerprintingDetected: false,
    },
    checkedAt: Date.now(),
  }
}

describe("inferRecommendations", () => {
  it("always returns exactly 4 recommendations", () => {
    const result = inferRecommendations([], [], null, 1)
    expect(result).toHaveLength(4)
  })

  it("always includes a legal recommendation as last item", () => {
    const result = inferRecommendations([], [], null, 1)
    expect(result[3]).toEqual({
      type: "legal",
      textKey: "recommendation_legal",
    })
  })

  describe("general recommendation", () => {
    it("returns low for riskScore 1", () => {
      const [general] = inferRecommendations([], [], null, 1)
      expect(general.textKey).toBe("recommendation_general_low")
    })

    it("returns medium for riskScore 2", () => {
      const [general] = inferRecommendations([], [], null, 2)
      expect(general.textKey).toBe("recommendation_general_medium")
    })

    it("returns medium for riskScore 3", () => {
      const [general] = inferRecommendations([], [], null, 3)
      expect(general.textKey).toBe("recommendation_general_medium")
    })

    it("returns high for riskScore 4", () => {
      const [general] = inferRecommendations([], [], null, 4)
      expect(general.textKey).toBe("recommendation_general_high")
    })

    it("returns high for riskScore 5", () => {
      const [general] = inferRecommendations([], [], null, 5)
      expect(general.textKey).toBe("recommendation_general_high")
    })
  })

  describe("tracker recommendation", () => {
    it("returns none when no trackers", () => {
      const [, tracker] = inferRecommendations([], [], null, 1)
      expect(tracker.textKey).toBe("recommendation_tracker_none")
    })

    it("returns ads when ads tracker exists", () => {
      const trackers = [
        makeTracker({ userCategory: TrackerCategoryForUser.ADS }),
      ]
      const [, tracker] = inferRecommendations(trackers, [], null, 1)
      expect(tracker.textKey).toBe("recommendation_tracker_ads")
    })

    it("returns other when non-ads trackers exist", () => {
      const trackers = [
        makeTracker({ userCategory: TrackerCategoryForUser.TRACKING }),
      ]
      const [, tracker] = inferRecommendations(trackers, [], null, 1)
      expect(tracker.textKey).toBe("recommendation_tracker_other")
    })
  })

  describe("cookie recommendation", () => {
    it("returns decline_banner when art7 violations are present", () => {
      const dsgvo = makeDsgvoResult({
        art7Passed: false,
        art7Violations: [{ name: "_ga", domain: "google.com", setAt: 500 }],
      })
      const [, , cookie] = inferRecommendations([], [], dsgvo, 1)
      expect(cookie.textKey).toBe("recommendation_cookie_decline_banner")
    })

    it("returns consent_suspicious when art7 fails without violations", () => {
      const dsgvo = makeDsgvoResult({ art7Passed: false, art7Violations: [] })
      const [, , cookie] = inferRecommendations([], [], dsgvo, 1)
      expect(cookie.textKey).toBe("recommendation_cookie_consent_suspicious")
    })

    it("returns tracking when tracking cookies exist and no art7 issue", () => {
      const cookies = [
        makeCookie({ userCategory: CookieCategoryForUser.TRACKING }),
      ]
      const [, , cookie] = inferRecommendations([], cookies, null, 1)
      expect(cookie.textKey).toBe("recommendation_cookie_tracking")
    })

    it("returns fine when no cookie issues", () => {
      const [, , cookie] = inferRecommendations([], [], null, 1)
      expect(cookie.textKey).toBe("recommendation_cookie_fine")
    })
  })
})
