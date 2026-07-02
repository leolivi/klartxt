import type { ClassifiedCookie } from "./types/cookie-types";
import { CookieCategoryForUser } from "./types/cookie-types";
import type { DsgvoResult } from "./types/dsgvo-types";
import type { TrackerInfo } from "./types/tracking-enums";
import { TrackerCategoryForUser } from "./types/tracking-enums";

export interface Recommendation {
  type: "cookie" | "tracker" | "general" | "legal";
  textKey: string;
}

function cookieRecommendation(dsgvoResult: DsgvoResult | null, cookiesList: ClassifiedCookie[]): Recommendation {
  if (dsgvoResult && !dsgvoResult.art7.passed) {
    if (dsgvoResult.art7.consentViolations.length > 0) {
      return { type: "cookie", textKey: "recommendation_cookie_decline_banner" };
    }
    return {
      type: "cookie",
      textKey: "recommendation_cookie_consent_suspicious",
    };
  }
  const hasTrackingCookies = cookiesList.some(c => c.userCategory === CookieCategoryForUser.TRACKING);
  if (hasTrackingCookies) {
    return { type: "cookie", textKey: "recommendation_cookie_tracking" };
  }
  return { type: "cookie", textKey: "recommendation_cookie_fine" };
}

function trackerRecommendation(trackerList: TrackerInfo[]): Recommendation {
  const hasAds = trackerList.some(t => t.userCategory === TrackerCategoryForUser.ADS);
  if (hasAds) return { type: "tracker", textKey: "recommendation_tracker_ads" };
  if (trackerList.length > 0) return { type: "tracker", textKey: "recommendation_tracker_other" };
  return { type: "tracker", textKey: "recommendation_tracker_none" };
}

function generalRecommendation(riskScore: number): Recommendation {
  if (riskScore >= 4) return { type: "general", textKey: "recommendation_general_high" };
  if (riskScore >= 2) return { type: "general", textKey: "recommendation_general_medium" };
  return { type: "general", textKey: "recommendation_general_low" };
}

export function inferRecommendations(
  trackerList: TrackerInfo[],
  cookiesList: ClassifiedCookie[],
  dsgvoResult: DsgvoResult | null,
  riskScore: number,
): Recommendation[] {
  return [
    generalRecommendation(riskScore),
    trackerRecommendation(trackerList),
    cookieRecommendation(dsgvoResult, cookiesList),
    { type: "legal", textKey: "recommendation_legal" },
  ];
}
