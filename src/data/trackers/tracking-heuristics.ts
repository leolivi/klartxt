/* -----
  Network Request Heuristics

  Sources per parameter group:
  - TRACKING_PARAMS Basis: DuckDuckGo Tracker Radar (tracking_parameters.json),
  - Ergänzungen (nicht in DDG erfasst):
    twclid: X Conversion Tracking Documentation von X Corp., 2026
    ttclid: TikTok Ads Pixel Dokumentation von TikTok For Business, 2025
    li_fat_id: LinkedIn, 2016

  - /collect, /pixel, /ping, /beacon: Konzept von Englehardt und Narayanan, 2016
  - /sync, /match, /cm: Konzept von Papadopoulos, Kourtellis und Markatos, 2020

  - USER_ID_PATTERN (UUID): RFC 9562 von Davis, Peabody und Leach, 2024
  - USER_ID_PATTERN (Long Hex): Papadopoulos, Kourtellis und Markatos (2019)
----- */

import trackingParamsData from "./tracking-params.json";

// DDG-measured params + platform-specific additions not captured by DDG
export const TRACKING_PARAMS = new Set<string>(trackingParamsData.params);

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
  "cdn.", 
];

// Cookie-Sync-Requests for cross-domain ID exchange
export const USER_ID_PATTERN = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{16,})$/i;
