/* -----
  Cookie Name Heuristics

  Sources per pattern group:
  - Generiert aus Open Cookie Database (Analytics / Marketing / Functional / Security):
    https://github.com/jkwakman/Open-Cookie-Database
    // TODO: add Open Cookie Database als quelle
  - Primärquelle Klassifikationsansatz: Munir u.a., 2023 (CookieGraph)
----- */

import cookieDataRaw from "./cookie-heuristics.json";

type CookieSet = Record<string, boolean>;

interface CookieHeuristics {
  version: string;
  necessary: CookieSet;
  session: CookieSet;
  analytics: CookieSet;
  advertising: CookieSet;
}

const cookieData = cookieDataRaw as unknown as CookieHeuristics;

const toLower = (set: CookieSet) => Object.keys(set).map((p) => p.toLowerCase());

export const NECESSARY_PATTERNS_LOWER = toLower(cookieData.necessary);
export const SESSION_PATTERNS_LOWER = toLower(cookieData.session);
export const ANALYTICS_PATTERNS_LOWER = toLower(cookieData.analytics);
export const ADVERTISING_PATTERNS_LOWER = toLower(cookieData.advertising);
