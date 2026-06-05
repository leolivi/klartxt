import type { DsgvoResult } from "./types/dsgvo-types";
import type { TrackerInfo } from "./types/tracking-enums";
import { TrackerCategory, TrackerCategoryForUser } from "./types/tracking-enums";
import type { ClassifiedCookie } from "./types/cookie-types";
import { CookieCategoryForUser } from "./types/cookie-types";

export type InsightSeverity = "fine" | "suspicious" | "confirmed";

export interface Insight {
  type: "tracker" | "cookie" | "dsgvo" | "profiling";
  severity: InsightSeverity;
  textKey: string;
  vars?: Record<string, string | number>;
}

function trackerInsight(trackerList: TrackerInfo[]): Insight {
  const adsTrackers = trackerList.filter(t => t.userCategory === TrackerCategoryForUser.ADS);

  if (trackerList.length === 0) {
    return { type: "tracker", severity: "fine", textKey: "insightTracker_none" };
  }

  if (adsTrackers.length > 0) {
    const companies = [...new Set(adsTrackers.map(t => t.owner).filter(Boolean))].slice(0, 2).join(", ");
    return {
      type: "tracker",
      severity: "confirmed",
      textKey: companies ? "insightTracker_ads_companies" : "insightTracker_ads",
      vars: { count: adsTrackers.length, companies },
    };
  }

  return { type: "tracker", severity: "suspicious", textKey: "insightTracker_other", vars: { count: trackerList.length } };
}

function cookieInsight(cookiesList: ClassifiedCookie[]): Insight {
  const trackingCookies = cookiesList.filter(c => c.userCategory === CookieCategoryForUser.TRACKING);

  if (cookiesList.length === 0) {
    return { type: "cookie", severity: "fine", textKey: "insightCookie_none" };
  }

  if (trackingCookies.length > 0) {
    return { type: "cookie", severity: "confirmed", textKey: "insightCookie_tracking", vars: { count: trackingCookies.length } };
  }

  return { type: "cookie", severity: "fine", textKey: "insightCookie_necessary" };
}

function dsgvoInsight(dsgvoResult: DsgvoResult | null): Insight {
  if (!dsgvoResult) {
    return { type: "dsgvo", severity: "fine", textKey: "insightDsgvo_noData" };
  }

  if (!dsgvoResult.art7.passed) {
    if (dsgvoResult.art7.consentViolations.length > 0) {
      return { type: "dsgvo", severity: "confirmed", textKey: "insightDsgvo_art7_violations" };
    }
    return { type: "dsgvo", severity: "suspicious", textKey: "insightDsgvo_art7_suspicious" };
  }

  if (!dsgvoResult.art25.passed) {
    if (dsgvoResult.art25.fingerprintingDetected) {
      return { type: "dsgvo", severity: "suspicious", textKey: "insightDsgvo_art25_fingerprinting" };
    }
    return { type: "dsgvo", severity: "confirmed", textKey: "insightDsgvo_art25_highRisk", vars: { count: dsgvoResult.art25.highRiskTrackerCount } };
  }

  if (!dsgvoResult.art13_14.passed) {
    return { type: "dsgvo", severity: "confirmed", textKey: "insightDsgvo_art1314" };
  }

  return { type: "dsgvo", severity: "fine", textKey: "insightDsgvo_fine" };
}

function profilingInsight(trackerList: TrackerInfo[]): Insight {
  const hasSessionReplay = trackerList.some(t =>
    t.detailedCategories.includes(TrackerCategory.SESSION)
  );
  const hasAdsOrAnalytics = trackerList.some(t =>
    t.detailedCategories.includes(TrackerCategory.AD) ||
    t.detailedCategories.includes(TrackerCategory.ANALYTICS)
  );
  const hasSocial = trackerList.some(t =>
    t.detailedCategories.includes(TrackerCategory.SOCIAL)
  );

  if (hasSessionReplay) {
    return { type: "profiling", severity: "confirmed", textKey: "insightProfiling_sessionReplay" };
  }
  if (hasAdsOrAnalytics && hasSocial) {
    return { type: "profiling", severity: "suspicious", textKey: "insightProfiling_crossContext" };
  }
  return { type: "profiling", severity: "fine", textKey: "insightProfiling_none" };
}

export function maxSeverity(insights: Insight[]): InsightSeverity {
  if (insights.some(i => i.severity === "confirmed")) return "confirmed";
  if (insights.some(i => i.severity === "suspicious")) return "suspicious";
  return "fine";
}

export function inferInsights(
  trackerList: TrackerInfo[],
  cookiesList: ClassifiedCookie[],
  dsgvoResult: DsgvoResult | null,
): Insight[] {
  return [
    dsgvoInsight(dsgvoResult),
    trackerInsight(trackerList),
    cookieInsight(cookiesList),
    profilingInsight(trackerList),
  ];
}
