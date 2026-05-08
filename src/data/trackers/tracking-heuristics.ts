/* -----
  Network Request Heuristics

  Sources per parameter group:
  - utm_*: Google Analytics URL Builders von Google, 2026b
  - fbclid: Bekos u.a., 2023
  - gclid, dclid, wbraid, gbraid, _gl: Session Attributes von Google, 2026a
  - msclkid: Microsoft Advertising Click ID von Microsoft, 2026
  - twclid: X Conversion Tracking Documentation von X Corp., 2026
  - ttclid: TikTok Ads Pixel Dokumentation von TikTok For Business, 2025
  - li_fat_id: LinkedIn, 2016

  - /collect, /pixel, /ping, /beacon: Konzept von Englehardt und Narayanan, 2016
  - /sync, /match, /cm: Konzept von Papadopoulos, Kourtellis und Markatos, 2020

  - USER_ID_PATTERN (UUID): RFC 9562 von Davis, Peabody und Leach, 2024
  - USER_ID_PATTERN (Long Hex): Papadopoulos, Kourtellis und Markatos (2019)
----- */

// Tracking parameters in query strings
export const TRACKING_PARAMS = new Set([
  // Google Analytics URL Builders
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  // Google Ads / Privacy Sandbox
  "gclid", "dclid", "wbraid", "gbraid", "_gl",
  // Meta (Facebook) — Bekos et al. (2022)
  "fbclid",
  // Microsoft Advertising
  "msclkid",
  // X Ads
  "twclid",
  // TikTok Ads
  "ttclid",
  // LinkedIn Ads
  "li_fat_id",
]);

// Tracking-relevant request paths
export const TRACKING_PATHS = [
  "/pixel",   
  "/beacon",  
  "/collect", 
  "/ping",    
  "/sync",    
  "/match",   
  "/cm",      
];

// Tracking-relevant subdomain prefixes
export const TRACKING_SUBDOMAINS = [
  "pixel.",   
  "track.",     
  "beacon.",    
  "analytics.", 
  "sync.",      
  "match.",     
];

// Cookie-Sync-Requests for cross-domain ID exchange
export const USER_ID_PATTERN = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{16,})$/i;
