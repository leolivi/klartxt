import fs from "fs";
import path from "path";

export const RESULTS_PATH = path.join("e2e", "test-results-data.json");

export type RunData = {
  score:              number;
  trackerDetails:     Array<{ domain: string }>;
  seenHostnames:      string[]; // unique hostnames Playwright observed
  playwrightRequests: number;   // total request count Playwright observed
  extensionRequests:  number;   // total requests the extension's webRequest saw
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
