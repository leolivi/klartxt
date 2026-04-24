/* ---- 
TODO: Das Problem ist dass die hardcoded Heuristiken noch nicht ideal sind... 
Bei den Testdurchläufen tauchen immer wieder fehlende Cookies auf die fälschlicherweise UNKNOWN sind. 
Ich werde noch ein Datenset suchen das hier helfen kann.
---- */

// CookieGraph heuristics (fallback) 
export const ANALYTICS_PATTERNS = [
  "_ga", "_gid", "_gat", "__utma", "__utmb", "__utmz", "_pk_", "matomo", "plausible", "_hjid", "amplitude", "cX_", "_sp_", "snowplow", "lux_", "__eoi", "__tbc", "xbc", "__pvi", "parrable",
];

export const ADVERTISING_PATTERNS = [
  "_fbp", "_fbc", "fr", "IDE", "DSID", "criteo", "adform", "doubleclick", "adsid", "_gcl", "_uetvid", "_twp", "mbox", "__vads", "pbjs", "sharedid", "cto_", "lux_uid", "moe_", "_pc", "__pid", "__pat", "_tt_", "ttcsid", "_ttp", "permutive", "FPID", "FPLC", 
"fpid", "__gads", "__gpi", "dakt_", "DqSync", "_k5a",
];

export const NECESSARY_PATTERNS = [
  "cookie_consent", "cookieconsent", "gdpr", "dsgvo", "language", "lang", "locale", "timezone", "currency", "__cmp", "__cf_", "_cfuvid", "adblocker", "OptanonConsent", "OptanonAlert", "eupubconsent", 
"OTAdditional", "FCCDCF",
];

export const SESSION_PATTERNS = [
  "session", "sess", "sid", "PHPSESSID", "JSESSIONID", "csrf", "xsrf", "token", "auth", "_vwo",
];