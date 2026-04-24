// Cookie Category 
/* 
Categories are based on categories extraction file @tracker-categories-ectraction.py
This file evaluates the categories from the Duck Duck Go Tracker Radar Json Files.
*/

// Cookie Category for Users (simplyfied)
export enum CookieCategoryForUser {
  NECESSARY = "necessary",           
  TRACKING = "tracking",             
  FUNCTIONAL = "functional",         
  UNKNOWN = "unknown",
}

export enum CookieCategory {
  NECESSARY = "necessary",           // technisch notwendig, kein Tracking
  FUNCTIONAL = "functional",         // Praeferenzen (Sprache, Theme etc.)
  ANALYTICS = "analytics",           // Nutzerverhalten messen
  ADVERTISING = "advertising",       // gezielte Werbung / Retargeting
  SESSION = "session",               // Session-Verwaltung
  CONSENT = "consent_management",    // Cookie-Banner selbst
  SECURITY = "security",             // Bot-Schutz, Fraud Detection (z.B. __cf_bm)
  UNKNOWN = "unknown",
}

export interface ClassifiedCookie {
  name: string;
  domain: string;
  category: CookieCategory;
  userCategory: CookieCategoryForUser;
  isThirdParty: boolean;
  httpOnly: boolean;
  secure: boolean;
}

