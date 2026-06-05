import fs from "fs";
import path from "path";

export const RESULTS_PATH = path.join("e2e", "test-results-data.json");

export type CookieEntry = {
  name:         string;
  domain:       string;
  category:     string;
  userCategory: string;
  isThirdParty: boolean;
  httpOnly:     boolean;
  secure:       boolean;
};

export type RunData = {
  score:              number;
  trackerDetails:     Array<{ domain: string }>;
  cookieDetails:      CookieEntry[];
  seenHostnames:      string[]; 
  playwrightRequests: number;   
  extensionRequests:  number;   
  scanCompleted:      boolean;
};

export type SiteData = {
  name: string;
  url:  string;
  runs: RunData[];
};

export type CollectedResults = { sites: SiteData[] };

export function readResults(): CollectedResults {
  return JSON.parse(fs.readFileSync(RESULTS_PATH, "utf8")) as CollectedResults;
}
