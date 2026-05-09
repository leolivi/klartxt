/* -----
  Cookie Name Heuristics
  Primärquelle: Munir u.a., 2023 (CookieGraph) — name-based classification als Fallback

  Sources per pattern group:

  ANALYTICS_PATTERNS:
  - _ga, _gid, _gat: Google, 2025a
  - __utma, __utmb, __utmz: Google, 2025a
  - _pk_, matomo: Matomo, 2026
  - plausible: Plausible Analytics Privacy Policy von Plausible, 2025
  - _hjid: Hotjar Privacy von Hotjar, 2025
  - amplitude: Amplitude Cookie Policy von Amplitude, 2025
  - cX_, _sp_, snowplow: Snowplow Cookie and Local Storage Usage von Snowplow, 2025
  - lux_: LUX (SpeedCurve Real User Monitoring) von SpeedCurve, 2025
  - __eoi, __tbc, xbc, __pvi, parrable: Parrable ID von Parrable, 2025

  ADVERTISING_PATTERNS:
  - _fbp, _fbc, fr: Meta Pixel Cookie Reference von Meta, 2025
  - IDE, DSID, doubleclick, adsid, __vads, __gads, __gpi: Google DoubleClick / Campaign Manager von Google, 2025b
  - _gcl, FPID, FPLC, fpid: Google Ads Conversion Linker und First-Party Cookies von Google, 2025c
  - _uetvid: Microsoft Advertising UET Tag Cookies von Microsoft, 2026
  - _twp: X Ads Pixel von X Corp., 2026
  - mbox: Adobe Target Cookie Reference von Adobe, 2025
  - criteo, cto_: Criteo Cookie Documentation von Criteo, 2025
  - adform: Adform Cookie Reference von Adform, 2025
  - pbjs, sharedid: Prebid.js SharedID Module von Prebid.org, 2025
  - _tt_, ttcsid, _ttp: TikTok Pixel Cookie Reference von TikTok For Business, 2025
  - permutive: Permutive Cookie Policy von Permutive, 2025
  - _pc, __pid, __pat: Piano Analytics (ehemals Cxense) von Piano, 2025
  - moe_: MoEngage Cookie Documentation von MoEngage, 2025
  - dakt_: Daktela Cookie Documentation von Daktela, 2025
  - DqSync, _k5a: Lotame DMP / IAS Cookie Sync — keine öffentliche Dokumentation,
    identifiziert via Munir u.a., 2023

  NECESSARY_PATTERNS:
  - cookie_consent, cookieconsent, gdpr, dsgvo, __cmp: Generische CMP-Muster
  - language, lang, locale, timezone, currency: HTTP-Präferenzen (RFC 7231)
  - __cf_, _cfuvid: Cloudflare Bot Management Cookies von Cloudflare, 2025
  - OptanonConsent, OptanonAlert, OTAdditional: OneTrust CMP von OneTrust, 2025
  - eupubconsent: IAB Europe Transparency and Consent Framework 2.0 von IAB Europe, 2019
  - FCCDCF: IAB Tech Lab CCPA Compliance Framework von IAB Tech Lab, 2020
  - adblocker: Adblocker-Detection-Pattern, keine spezifische Quelle

  SESSION_PATTERNS:
  - session, sess, sid: Generische Session-Bezeichner (RFC 6265)
  - PHPSESSID: PHP Session Handling von The PHP Group, 2025
  - JSESSIONID: Jakarta EE Servlet Specification 6.0 von Eclipse Foundation, 2022
  - csrf, xsrf: OWASP Cross-Site Request Forgery Prevention Cheat Sheet von OWASP, 2024
  - token, auth: Generische Authentifizierungs-Muster
  - _vwo: VWO (Visual Website Optimizer) Cookie Reference von Wingify, 2025
----- */

// CookieGraph heuristics (fallback)
const ANALYTICS_PATTERNS = [
  "_ga", "_gid", "_gat", "__utma", "__utmb", "__utmz", "_pk_", "matomo", "plausible", "_hjid", "amplitude", "cX_", "_sp_", "snowplow", "lux_", "__eoi", "__tbc", "xbc", "__pvi", "parrable",
];

const ADVERTISING_PATTERNS = [
  "_fbp", "_fbc", "fr", "IDE", "DSID", "criteo", "adform", "doubleclick", "adsid", "_gcl", "_uetvid", "_twp", "mbox", "__vads", "pbjs", "sharedid", "cto_", "lux_uid", "moe_", "_pc", "__pid", "__pat", "_tt_", "ttcsid", "_ttp", "permutive", "FPID", "FPLC",
  "fpid", "__gads", "__gpi", "dakt_", "DqSync", "_k5a",
];

const NECESSARY_PATTERNS = [
  "cookie_consent", "cookieconsent", "gdpr", "dsgvo", "language", "lang", "locale", "timezone", "currency", "__cmp", "__cf_", "_cfuvid", "adblocker", "OptanonConsent", "OptanonAlert", "eupubconsent",
  "OTAdditional", "FCCDCF",
];

const SESSION_PATTERNS = [
  "session", "sess", "sid", "PHPSESSID", "JSESSIONID", "csrf", "xsrf", "token", "auth", "_vwo",
];

const toLower = (patterns: string[]) => patterns.map(p => p.toLowerCase());

export const NECESSARY_PATTERNS_LOWER = toLower(NECESSARY_PATTERNS);
export const SESSION_PATTERNS_LOWER = toLower(SESSION_PATTERNS);
export const ANALYTICS_PATTERNS_LOWER = toLower(ANALYTICS_PATTERNS);
export const ADVERTISING_PATTERNS_LOWER = toLower(ADVERTISING_PATTERNS);