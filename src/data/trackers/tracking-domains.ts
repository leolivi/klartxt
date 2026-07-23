import { calculateTrackerRiskScore } from "@/utils/scoring/network-risk-score";
import {
  TrackerCategory,
  TrackerCategoryForUser,
  TrackerConfidence,
  type TrackerInfo,
} from "../../utils/types/tracking-enums";

/* -----
  Networt Request Classification
  Sources:
  - DDG Tracker Radar: DuckDuckGo, Inc., 2025
----- */

interface CompressedTracker {
  o: string | null;
  c: string[];
  p: number;
  f: number;
}

interface TrackerFile {
  trackers: Record<string, CompressedTracker>;
}

// Maps raw DDG Tracker Radar (DuckDuckGo, Inc., 2025) category strings to internal TrackerCategory enums
// Multiple DDG categories can map to the same enum (e.g. "Advertising" and "Ad Motivated" both -> AD)
// UNKNOWN is the fallback when no category matches
function mapToCategories(categories: string[]): TrackerCategory[] {
  const result = new Set<TrackerCategory>();
  const has = (str: string) => categories.some(c => c.toLowerCase().includes(str.toLowerCase()));

  if (has("Malware") || has("Unknown High Risk")) result.add(TrackerCategory.MALWARE);

  if (has("Session Replay")) result.add(TrackerCategory.SESSION);

  if (has("Advertising") || has("Ad Motivated") || has("Action Pixels")) result.add(TrackerCategory.AD);

  if (has("Analytics") || has("Audience Measurement") || has("Third-Party Analytics"))
    result.add(TrackerCategory.ANALYTICS);

  if (has("Social")) result.add(TrackerCategory.SOCIAL);

  if (has("Embedded Content")) result.add(TrackerCategory.EMBEDDED);

  if (has("CDN")) result.add(TrackerCategory.CDN);

  if (has("Consent Management")) result.add(TrackerCategory.CONSENT);

  if (has("Tag Manager")) result.add(TrackerCategory.TAG_MANAGER);

  if (has("Online Payment") || has("Support Chat") || has("Federated Login") || has("SSO"))
    result.add(TrackerCategory.FUNCTIONAL);

  if (has("Fraud") || has("Ad Fraud")) result.add(TrackerCategory.SECURITY);

  if (result.size === 0) result.add(TrackerCategory.UNKNOWN);

  return Array.from(result);
}

// Collapses internal categories into a user-facing label. Priority order matters:
// MALWARE/SECURITY before ADS before TRACKING before FUNCTIONAL before CONTENT
// a tracker can have multiple detailed categories, only the highest-priority user-facing label is surfaced to avoid overwhelming the UI.
function mapToUserCategory(categories: TrackerCategory[]): TrackerCategoryForUser {
  if (categories.includes(TrackerCategory.MALWARE)) {
    return TrackerCategoryForUser.SECURITY;
  }

  if (categories.includes(TrackerCategory.SECURITY)) {
    return TrackerCategoryForUser.SECURITY;
  }

  if (categories.includes(TrackerCategory.AD)) {
    return TrackerCategoryForUser.ADS;
  }

  if (categories.includes(TrackerCategory.SESSION)) {
    return TrackerCategoryForUser.SESSION;
  }

  if (categories.includes(TrackerCategory.ANALYTICS) || categories.includes(TrackerCategory.TAG_MANAGER)) {
    return TrackerCategoryForUser.TRACKING;
  }

  if (categories.includes(TrackerCategory.FUNCTIONAL) || categories.includes(TrackerCategory.CONSENT)) {
    return TrackerCategoryForUser.FUNCTIONAL;
  }

  if (
    categories.includes(TrackerCategory.EMBEDDED) ||
    categories.includes(TrackerCategory.CDN) ||
    categories.includes(TrackerCategory.SOCIAL)
  ) {
    return TrackerCategoryForUser.CONTENT;
  }

  return TrackerCategoryForUser.TRACKING;
}

export const TRACKER_MAP = new Map<string, TrackerInfo>();

async function loadFromUrl(url: string): Promise<TrackerFile> {
  const response = await fetch(url);
  return (await response.json()) as TrackerFile;
}

function ingest(data: TrackerFile, overwrite = false): void {
  Object.entries(data.trackers).forEach(([domain, info]) => {
    if (!overwrite && TRACKER_MAP.has(domain)) return;

    const categories = mapToCategories(info.c);
    const riskScore = calculateTrackerRiskScore(categories, TrackerConfidence.CONFIRMED);

    TRACKER_MAP.set(domain, {
      domain,
      owner: info.o,
      userCategory: mapToUserCategory(categories),
      detailedCategories: categories,
      riskScore,
      confidence: TrackerConfidence.CONFIRMED,
      fingerprintingScore: info.f ?? 0,
    });
  });
}

// known tracker domains and their types detectetd in network requests
export async function initTrackerData(): Promise<void> {
  // load core data (first badge)
  const coreUrl = chrome.runtime.getURL("src/data/trackers/tracker-core.json");
  const core = await loadFromUrl(coreUrl);
  ingest(core);
  // console.debug(`Core loaded: ${TRACKER_MAP.size} trackers`);

  // load extended data (second badge, lazy load)
  loadFromUrl(chrome.runtime.getURL("src/data/trackers/tracker-extended.json"))
    .then(extended => {
      ingest(extended);
      // console.debug(`Extended loaded: ${TRACKER_MAP.size} total trackers`);
    })
    .catch(e => console.log("Extended konnte nicht geladen werden", e));
}
