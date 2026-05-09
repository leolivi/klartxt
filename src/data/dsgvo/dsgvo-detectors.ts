/* -----
DSGVO Detectors

Source:
- CMP_SELECTORS: Generiert aus Consent-O-Matic CMP-Regeln (Nouwens und Nylandsted Klokmose, 2025)
- PRIVACY_PATTERNS: privacy, datenschutz, cookie.policy: typische Linktexte / href-Muster gemäss Art. 13 Abs. 1 DSGVO (Europäische Union, 2016)
----- */

import cmpData from "./cmp-selectors.json";

export const CMP_SELECTORS: string[] = cmpData.selectors;

export const PRIVACY_PATTERNS = /privacy|datenschutz|legal|impressum|cookie.policy/i;