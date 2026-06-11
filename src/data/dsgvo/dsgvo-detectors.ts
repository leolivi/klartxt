/* -----
DSGVO Detectors

Source:
- CMP_SELECTORS: Generiert aus Consent-O-Matic CMP-Regeln (Nouwens und Nylandsted Klokmose, 2025)
- PRIVACY_PATTERNS: privacy, datenschutz, cookie.policy: typical link texts / href-patterns that can indicate GDPR Compliance ->  Art. 13 Abs. 1 DSGVO (Europäische Union, 2016)
----- */

import cmpDataRaw from "./cmp-selectors.json";

interface CmpData {
  version: string;
  cmps: Record<string, boolean>;
  selectors: Record<string, boolean>;
}

const cmpData = cmpDataRaw as CmpData;

export const CMP_SELECTORS: string[] = Object.keys(cmpData.selectors);

export const PRIVACY_PATTERNS = /privacy|datenschutz|legal|impressum|cookie.policy/i;