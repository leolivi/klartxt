import { NETWORK_EXCLUSIONS } from "@/data/trackers/false-positive-list";
import { TRACKER_MAP } from "@/data/trackers/tracking-domains";
import {
  TRACKING_PARAMS,
  TRACKING_PATHS,
  TRACKING_SUBDOMAINS,
  USER_ID_PATTERN,
} from "@/data/trackers/tracking-heuristics";
import { calculateTrackerRiskScore } from "@/utils/scoring/network-risk-score";
import {
  TrackerCategory,
  TrackerCategoryForUser,
  TrackerConfidence,
  type DetectedTracker,
  type TrackerInfo,
} from "@/utils/types/tracking-enums";
import { parse } from "tldts";

interface HandleNetworkRequests {
  details: chrome.webRequest.OnBeforeRequestDetails;
  onTrackerDetected: (tracker: DetectedTracker) => void;
}

// detect tracking params in query string (heuristics)
function hasTrackingParams(url: URL): boolean {
  for (const param of url.searchParams.keys()) {
    if (TRACKING_PARAMS.has(param)) return true;
  }
  return false;
}

// detect pixel/beacon request paths (heuristics)
function hasTrackingPath(url: URL): boolean {
  const path = url.pathname.toLowerCase();
  return TRACKING_PATHS.some(p => path.includes(p));
}

// detect tracking subdomains using the eTLD+1-parsed subdomain label
// e.g. track.example.co.uk -> subdomain "track" -> matches "track."
function hasTrackingSubdomain(subdomain: string): boolean {
  if (!subdomain) return false;
  const firstLabel = subdomain.split(".")[0] + ".";
  return TRACKING_SUBDOMAINS.has(firstLabel);
}

// cookie-sync: two or more UUID/long-hex values in query string indicate ID exchange
function hasCookieSyncPattern(url: URL): boolean {
  let idCount = 0;
  for (const value of url.searchParams.values()) {
    if (USER_ID_PATTERN.test(value)) {
      idCount++;
      if (idCount >= 2) return true;
    }
  }
  return false;
}

function buildSuspiciousTracker(domain: string): TrackerInfo {
  const categories = [TrackerCategory.UNKNOWN];
  return {
    domain,
    owner: null,
    userCategory: TrackerCategoryForUser.TRACKING,
    detailedCategories: categories,
    riskScore: calculateTrackerRiskScore(categories, TrackerConfidence.SUSPICIOUS),
    confidence: TrackerConfidence.SUSPICIOUS,
    fingerprintingScore: 0,
  };
}

// 1. DDG Tracker Radar (DuckDuckGo, Inc., 2025) is the primary source (CONFIRMED confidence).
// 2. Heuristics (tracking params, paths, subdomains, cookie-sync patterns) are the fallback for domains not in the Radar database (SUSPICIOUS confidence).
export function handleNetworkRequests({ details, onTrackerDetected }: HandleNetworkRequests): void {
  let url: URL;

  try {
    url = new URL(details.url);
  } catch {
    return;
  }

  // parse the raw hostname first so tldts (PSL-aware) resolves the registrable domain and
  // subdomain correctly for multi-part TLDs (.co.uk, .com.au) before any "www" stripping —
  // stripping "www." off the raw string first could mangle a hostname where "www" is itself
  // the registrable label (e.g. www.co.uk) rather than a stylistic subdomain
  const parsed = parse(url.hostname);
  const registrable = parsed.domain ?? url.hostname;
  const subdomain = (parsed.subdomain ?? "").replace(/^www(\.|$)/, "");
  const hostname = subdomain ? `${subdomain}.${registrable}` : registrable;

  if (NETWORK_EXCLUSIONS.has(hostname)) return;

  // DDG Radar lookup
  const radarMatch = TRACKER_MAP.get(hostname) ?? (hostname !== registrable ? TRACKER_MAP.get(registrable) : undefined);

  // heuristics
  const heuristicMatch =
    hasTrackingParams(url) || hasTrackingPath(url) || hasTrackingSubdomain(subdomain) || hasCookieSyncPattern(url);

  if (radarMatch) {
    return onTrackerDetected({
      tracker: radarMatch,
      confidence: TrackerConfidence.CONFIRMED,
    });
  }

  if (!heuristicMatch) return;

  onTrackerDetected({
    tracker: buildSuspiciousTracker(hostname),
    confidence: TrackerConfidence.SUSPICIOUS,
  });
}
