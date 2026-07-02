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
  NECESSARY = "necessary", // technical cookies (e.g. session management, cookie banner)
  FUNCTIONAL = "functional", // preference cookies (e.g. language, theme)
  ANALYTICS = "analytics", // measurement of user behavior (e.g. Google Analytics, Matomo)
  ADVERTISING = "advertising", // advertising cookies (e.g. Google Ads, Facebook Pixel)
  SESSION = "session", // session cookies (e.g. PHPSESSID, JSESSIONID)
  CONSENT = "consent_management", // cookie-banner, consent management (e.g. Cookiebot, OneTrust)
  SECURITY = "security", // bot protection, fraud detection, security
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
