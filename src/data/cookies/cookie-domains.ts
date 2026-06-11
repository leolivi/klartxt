import { CookieCategory, CookieCategoryForUser } from "@/utils/types/cookie-types";
import { TRACKER_MAP } from "@/data/trackers/tracking-domains";
import { ADVERTISING_PATTERNS_LOWER, ANALYTICS_PATTERNS_LOWER, NECESSARY_PATTERNS_LOWER, SESSION_PATTERNS_LOWER } from "@/data/cookies/cookie-heuristics";

/* -----
  Cookie Classification
  Sources:
  - DDG Tracker Radar: domain-based classifications (primary)
  - Englehardt & Narayanan (2016): First/Third-Party via root domain comparison
  - CookieGraph (Munir et al. 2023): name-based heuristics as fallback
    - Cookie-Name Pattern
    - Cookie-Lifetime
----- */

const rootDomainCache = new Map<string, string>();

const NECESSARY_MIN3 = NECESSARY_PATTERNS_LOWER.filter(p => p.length >= 3);
const SESSION_MIN3 = SESSION_PATTERNS_LOWER.filter(p => p.length >= 3);
const ANALYTICS_MIN3 = ANALYTICS_PATTERNS_LOWER.filter(p => p.length >= 3);
const ADVERTISING_MIN3 = ADVERTISING_PATTERNS_LOWER.filter(p => p.length >= 3);

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

  // Explicit overrides before heuristic pattern matching
  if (lower.includes("csrf") || lower.includes("xsrf")) return CookieCategory.SECURITY;
  if (lower === "jsessionid" || lower === "phpsessid" || lower === "asp.net_sessionid") return CookieCategory.NECESSARY;

  if (NECESSARY_MIN3.some((p) => lower.includes(p))) return CookieCategory.NECESSARY;
  if (SESSION_MIN3.some((p) => lower.includes(p))) return CookieCategory.SESSION;
  if (ANALYTICS_MIN3.some((p) => lower.includes(p))) return CookieCategory.ANALYTICS;
  if (ADVERTISING_MIN3.some((p) => lower.includes(p))) return CookieCategory.ADVERTISING;
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

  const nameCategory = mapNameToCategory(cookieName);

  // 2. CookieGraph: lange Lebensdauer + name pattern
  if (isLongLivedCookie(cookie) && nameCategory !== CookieCategory.UNKNOWN) {
    return nameCategory;
  }
  // 3. Name-Pattern Fallback
  return nameCategory;
}

// Englehardt & Narayanan: First/Third-Party via root domain comparison (Public Suffix + 1 )
export function extractRootDomain(hostname: string): string {
  if (rootDomainCache.has(hostname)) return rootDomainCache.get(hostname)!;
  const parts = hostname.replace(/^\./, "").split(".");
  const result = parts.length <= 2 ? parts.join(".") : parts.slice(-2).join(".");
  rootDomainCache.set(hostname, result);
  return result;
}