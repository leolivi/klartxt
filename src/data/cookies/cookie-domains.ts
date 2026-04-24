import { CookieCategory, CookieCategoryForUser } from "@/utils/types/cookie-types";
import { TRACKER_MAP } from "@/data/trackers/tracking-domains";
import { ADVERTISING_PATTERNS, ANALYTICS_PATTERNS, NECESSARY_PATTERNS, SESSION_PATTERNS } from "@/data/cookies/cookie-heuristics";

/* -----
  Cookie Classification
  Sources:
  - DDG Tracker Radar: domain-based classifications (primary)
  - Englehardt & Narayanan (2016): First/Third-Party via root domain comparison
  - CookieGraph (Munir et al. 2023): name-based heuristics as fallback
    - Cookie-Name Pattern
    - Cookie-Lifetime
----- */

export function mapToUserCategory(category: CookieCategory): CookieCategoryForUser {
  switch (category) {
    case CookieCategory.NECESSARY:
    case CookieCategory.SECURITY:
    case CookieCategory.CONSENT:
      return CookieCategoryForUser.NECESSARY;
    case CookieCategory.ANALYTICS:
    case CookieCategory.ADVERTISING:
    case CookieCategory.SESSION:
      return CookieCategoryForUser.TRACKING;
    case CookieCategory.FUNCTIONAL:
      return CookieCategoryForUser.FUNCTIONAL;
    default:
      return CookieCategoryForUser.UNKNOWN;
  }
}

// CookieGraph: Cookie-Name Pattern
export function mapNameToCategory(name: string): CookieCategory {
  const lower = name.toLowerCase();
  if (NECESSARY_PATTERNS.some((p) => lower.includes(p.toLowerCase()))) return CookieCategory.NECESSARY;
  if (SESSION_PATTERNS.some((p) => lower.includes(p.toLowerCase()))) return CookieCategory.SESSION;
  if (ANALYTICS_PATTERNS.some((p) => lower.includes(p.toLowerCase()))) return CookieCategory.ANALYTICS;
  if (ADVERTISING_PATTERNS.some((p) => lower.includes(p.toLowerCase()))) return CookieCategory.ADVERTISING;
  return CookieCategory.UNKNOWN;
}

// CookieGraph: Cookie-Lifetime
export function isLongLivedCookie(cookie: chrome.cookies.Cookie): boolean {
  if (!cookie.expirationDate) return false;
  const daysUntilExpiry = (cookie.expirationDate - Date.now() / 1000) / 86400;
  return daysUntilExpiry > 365;
}

// DDG Tracker Radar: domain-based classification
function mapTrackerCategoryToCookieCategory(trackerCategory: string): CookieCategory {
  switch (trackerCategory) {
    case "advertising": return CookieCategory.ADVERTISING;
    case "analytics": return CookieCategory.ANALYTICS;
    case "social": return CookieCategory.ADVERTISING;
    case "session_replay": return CookieCategory.ANALYTICS;
    default: return CookieCategory.UNKNOWN;
  }
}

export function classifyCookieCategory(
  cookieName: string,
  cookieRootDomain: string,
  cookie: chrome.cookies.Cookie
): CookieCategory {
  // 1. DDG Tracker Radar
  const trackerInfo = TRACKER_MAP.get(cookieRootDomain);
  if (trackerInfo) {
    return mapTrackerCategoryToCookieCategory(trackerInfo.detailedCategories[0] ?? "unknown");
  }
  // 2. CookieGraph: lange Lebensdauer + name pattern
  if (isLongLivedCookie(cookie) && mapNameToCategory(cookieName) !== CookieCategory.UNKNOWN) {
    return mapNameToCategory(cookieName);
  }
  // 3. Name-Pattern Fallback
  return mapNameToCategory(cookieName);
}

// Englehardt & Narayanan: First/Third-Party via root domain comparison
export function extractRootDomain(hostname: string): string {
  const parts = hostname.replace(/^\./, "").split(".");
  if (parts.length <= 2) return parts.join(".");
  return parts.slice(-2).join(".");
}