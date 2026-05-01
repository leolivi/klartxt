export const CMP_SELECTORS = [
    "#onetrust-banner-sdk",
    "#cookiebanner",
    "[id*='cookie-banner']",
    "[id*='consent-banner']",
    "[class*='cookie-banner']",
    "[class*='consent-banner']",
    "[class*='cmp-']",
    "[class*='cmpbox']",      
    "[class*='cmpstyle']",    
    "[class*='cmpBox']", 
    "#Cookiebot",
    ".cc-window",
    "[id*='cookie-consent']",
    "[class*='cookie-consent']",
];

export const PRIVACY_PATTERNS = /privacy|datenschutz|legal|impressum|cookie.policy/i;

export const INFRASTRUCTURE_DOMAINS = new Set([
  // Consent Tools
  "cookielaw.org",
  "onetrust.com",
  "consentmanager.net",
  "cookiebot.com",
  "usercentrics.eu",
  // CDN / Infrastructure
  "cloudinary.com",
  "ctfassets.net",    // Contentful CDN
  "fonts.net",        // Monotype Fonts
  "fonts.googleapis.com",
  "fonts.gstatic.com",
]);