/* -----
  DSGVO Detectors

  Sources per detector:

  CMP_SELECTORS — CSS-Selektoren zur Erkennung von Consent-Management-Plattformen im DOM:
  - #onetrust-banner-sdk: OneTrust CMP DOM-Struktur von OneTrust, 2025
  - #Cookiebot: Cookiebot (Usercentrics/Cybot) DOM-Struktur von Cookiebot, 2025
  - .cc-window: CookieConsent by Osano (Open Source) von Osano, 2025
  - [class*='cmp-'], [class*='cmpbox'], [class*='cmpstyle'], [class*='cmpBox']:
    consentmanager.net CSS-Klassen von consentmanager.net, 2025
  - Generische Muster (cookie-banner, consent-banner, cookie-consent):
    Matte u.a., 2020; Nouwens u.a., 2020

  PRIVACY_PATTERNS — Regex zur Erkennung von Datenschutzerklaerungslinks:
  - privacy, datenschutz, cookie.policy: typische Linktexte / href-Muster
    gemaess Art. 13 Abs. 1 DSGVO (Pflicht zur leicht zugaenglichen Datenschutzerklarung)
  - impressum, legal: Impressumspflicht gemaess § 5 TMG (Telemediengesetz)
  - Ansatz: Matte u.a., 2020; Santos u.a., 2021

  INFRASTRUCTURE_DOMAINS — Domains die als CDN/CMP-Infrastruktur eingestuft
  und nicht als Tracker gewertet werden:
  - cookielaw.org, onetrust.com: OneTrust CMP von OneTrust, 2025
  - consentmanager.net: consentmanager CMP von consentmanager.net, 2025
  - cookiebot.com: Cookiebot CMP von Cookiebot, 2025
  - usercentrics.eu: Usercentrics CMP von Usercentrics, 2025
  - cloudinary.com: Cloudinary Media CDN von Cloudinary, 2025
  - ctfassets.net: Contentful Asset CDN von Contentful, 2025
  - fonts.net: Monotype Web Fonts von Monotype, 2025
  - fonts.googleapis.com, fonts.gstatic.com: Google Fonts von Google, 2025d
----- */

export const CMP_SELECTORS = [
    "#onetrust-banner-sdk",      // OneTrust
    "#cookiebanner",
    "[id*='cookie-banner']",
    "[id*='consent-banner']",
    "[class*='cookie-banner']",
    "[class*='consent-banner']",
    "[class*='cmp-']",           // consentmanager.net
    "[class*='cmpbox']",
    "[class*='cmpstyle']",
    "[class*='cmpBox']",
    "#Cookiebot",                // Cookiebot (Usercentrics/Cybot)
    ".cc-window",                // CookieConsent by Osano
    "[id*='cookie-consent']",
    "[class*='cookie-consent']",
];

export const PRIVACY_PATTERNS = /privacy|datenschutz|legal|impressum|cookie.policy/i;

export const INFRASTRUCTURE_DOMAINS = new Set([
  // Consent Tools
  "cookielaw.org",       // OneTrust
  "onetrust.com",        // OneTrust
  "consentmanager.net",  // consentmanager
  "cookiebot.com",       // Cookiebot (Usercentrics/Cybot)
  "usercentrics.eu",     // Usercentrics
  // CDN / Infrastructure
  "cloudinary.com",      // Cloudinary Media CDN
  "ctfassets.net",       // Contentful CDN
  "fonts.net",           // Monotype Fonts
  "fonts.googleapis.com",// Google Fonts
  "fonts.gstatic.com",   // Google Fonts
]);