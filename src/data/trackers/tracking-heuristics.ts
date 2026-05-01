/* -----
  Network Request Heuristics
  Sources:
// TODO: add sources to README
  - Tracking-Parameter: basierend auf Google Analytics, Meta Pixel, Microsoft Ads Dokumentation
  - Pixel/Beacon Pfade: eigene Heuristik basierend auf gängigen Tracking-Implementierungen
----- */

// Tracking parameters in query strings
export const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "fbclid", "gclid", "msclkid", "twclid", "ttclid",
  "ref", "referrer", "affiliate_id", "click_id",
]);

// Pixel Requests paths
export const TRACKING_PATHS = [
  "/pixel", "/track", "/beacon", "/collect",
  "/ping", "/log", "/hit", "/event",
  "/impression", "/click", "/view",
];
