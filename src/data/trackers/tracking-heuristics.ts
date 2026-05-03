/* -----
  Network Request Heuristics
  Sources:
// TODO: add sources to README
  - Tracking-Parameter: basierend auf Google Analytics, Meta Pixel, Microsoft Ads, LinkedIn Dokumentation
  - Pixel/Beacon Pfade: eigene Heuristik basierend auf gängigen Tracking-Implementierungen
  - Subdomain-Heuristik: gängige Tracking-Subdomain-Präfixe
  - Cookie-Sync: UUID/ID-Muster im Query-String
----- */

// Tracking parameters in query strings
export const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "fbclid", "gclid", "dclid", "msclkid", "twclid", "ttclid",
  // Google enhanced conversions
  "wbraid", "gbraid", "_gl",
  // Social
  "igshid", "li_fat_id",
  "ref", "referrer", "affiliate_id", "click_id",
]);

// Pixel Requests paths
export const TRACKING_PATHS = [
  "/pixel", "/track", "/beacon", "/collect",
  "/ping", "/log", "/hit", "/event",
  "/impression", "/click", "/view",
  // Cookie-sync / ID-match endpoints
  "/sync", "/match", "/cm", "/id", "/uuid",
];

// Subdomain prefixes that strongly indicate tracking infrastructure
export const TRACKING_SUBDOMAINS = [
  "track.", "pixel.", "beacon.",
  "analytics.", "stats.", "collect.",
  "sync.", "match.",
];

// Matches UUIDs and long hex IDs (≥16 chars) used in cookie-sync requests
export const USER_ID_PATTERN = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{16,})$/i;

