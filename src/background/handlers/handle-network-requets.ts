import { NETWORK_EXCLUSIONS } from "@/data/trackers/false-positive-list";
import { TRACKER_MAP } from "@/data/trackers/tracking-domains";
import { TRACKING_PARAMS, TRACKING_PATHS } from "@/data/trackers/tracking-heuristics";
import { calculateTrackerRiskScore } from "@/utils/scoring/network-risk-score";
import { TrackerCategory, TrackerCategoryForUser, TrackerConfidence, type DetectedTracker, type TrackerInfo } from "@/utils/types/tracking-enums";

interface HandleNetworkRequests {
  details: chrome.webRequest.OnBeforeRequestDetails;
  onTrackerDetected: (tracker: DetectedTracker) => void;
}

const registrableDomainCache = new Map<string, string>();

// detect subdomains (DDG)
function extractRegistrableDomain(hostname: string): string {
  if (registrableDomainCache.has(hostname)) {
    return registrableDomainCache.get(hostname)!;
  }
  const parts = hostname.split(".");
  const result = parts.length <= 2 ? hostname : parts.slice(-2).join(".");
  registrableDomainCache.set(hostname, result);
  return result;
}

// detect tracking params in query string (heuristics)
function hasTrackingParams(url: URL): boolean {
  for (const param of url.searchParams.keys()) {
    if (TRACKING_PARAMS.has(param)) return true;
  }
  return false;
}

// detect pixel request paths (heuristics)
function hasTrackingPath(url: URL): boolean {
  const path = url.pathname.toLowerCase();
  return TRACKING_PATHS.some((p) => path.includes(p));
}


function buildSuspiciousTracker(domain: string): TrackerInfo {
  const categories = [TrackerCategory.UNKNOWN];
  return {
    domain,
    owner: null,
    userCategory: TrackerCategoryForUser.TRACKING,
    detailedCategories: categories,
    riskScore: calculateTrackerRiskScore(categories, TrackerConfidence.CONFIRMED),
    confidence: TrackerConfidence.SUSPICIOUS,
  };
}

// function to handle network request tracking
export function handleNetworkRequests({
  details,
  onTrackerDetected,
}: HandleNetworkRequests): void {
  let url: URL;

  try {
    url = new URL(details.url);
  } catch {
    return;
  }

  // check if request is a tracker
  const domain = url.hostname.replace(/^www\./, "");
  if (NETWORK_EXCLUSIONS.has(domain)) return;

  const registrable = extractRegistrableDomain(domain);

  // DDG Radar lookup
  const radarMatch = TRACKER_MAP.get(domain) ?? (domain !== registrable ? TRACKER_MAP.get(registrable) : undefined);

  // heuristics
  const heuristicMatch =
    hasTrackingParams(url) ||
    hasTrackingPath(url)

  // conficence logic
  if (radarMatch) { // includes heuristicMatch and radarMatch
    // increment in memory counter of trackers
    return onTrackerDetected({
      tracker: radarMatch,
      confidence: TrackerConfidence.CONFIRMED,
    });
  }

  if (!heuristicMatch) return;

  //if no radar match only heuristics define as suspicious
  onTrackerDetected({
    tracker: buildSuspiciousTracker(domain),
    confidence: TrackerConfidence.SUSPICIOUS,
  });
}
