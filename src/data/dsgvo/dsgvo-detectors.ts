/* -----
DSGVO Detectors

Source:
- CMP_SELECTORS: generated from Consent-O-Matic CMP-Regeln (Nouwens und Nylandsted Klokmose, 2025)
- PRIVACY_PATTERNS: privacy, policy, cookie.policy: typical link texts / href-patterns that can indicate GDPR Compliance -> Art. 13 Abs. 1 DSGVO (Europäische Union, 2016)
----- */

import cmpDataRaw from "./cmp-selectors.json";

interface CmpData {
  version: string;
  cmps: Record<string, boolean>;
  selectors: Record<string, boolean>;
}

const cmpData = cmpDataRaw as CmpData;

export const CMP_SELECTORS: string[] = Object.keys(cmpData.selectors);

// fallbacks for banners not covered by Consent-O-Matic rules
export const BANNER_FALLBACK_SELECTORS: string[] = [
  '[aria-label*="cookie" i]',
  '[aria-label*="consent" i]',
  '[aria-label*="datenschutz" i]',
  '[id*="cookie_notification"]',
  '[id*="cookie-notice"]',
  '[id*="cookie-banner"]',
  '[id*="cookiebanner"]',
  '[id*="cookieconsent"]',
  '[id*="cookie_consent"]',
  '[id*="consent" i]',
  '[class*="consent-banner" i]',
  '[id*="fides" i]',
  '[class*="fides" i]',
  "uhf-cookie-banner",
];

export const PRIVACY_PATTERNS = /privacy|datenschutz|legal|impressum|cookie.policy/i;
