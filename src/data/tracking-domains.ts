import {TrackerCategory} from "../utils/types/tracking-enums";

/* -----
  Known tracker domains dataset 
  sources:
  - DuckDuckGo Tracker Radar:https://github.com/duckduckgo/tracker-radar/tree/main
----- */

interface CompressedTracker {
    o: string | null;     
    c: string[];           
    p: number;             
    f: number;             
}

interface TrackerFile {
    trackers: Record<string, CompressedTracker>;
}

export interface TrackerInfo {
    domain: string;
    owner: string | null;
    category: TrackerCategory;
}

// map categories to match TrackerPurpose
function mapToCategory(categories: string[]): TrackerCategory {
    if (categories.some((c) => c.includes("Social"))) return TrackerCategory.SOCIAL;
    if (categories.some((c) => c.includes("Session Replay"))) return TrackerCategory.SESSION;
    if (categories.some((c) =>
    c.includes("Advertising") ||
    c.includes("Ad Motivated") ||
    c.includes("Action Pixels")
    )) return TrackerCategory.AD;
    if (categories.some((c) =>
    c.includes("Analytics") ||
    c.includes("Audience Measurement") ||
    c.includes("Third-Party Analytics")
    )) return TrackerCategory.ANALYTICS;
    if (categories.some((c) => c.includes("CDN"))) return TrackerCategory.CDN;
    return TrackerCategory.UNKNOWN;
    }

export const TRACKER_MAP = new Map<string, TrackerInfo>();

async function loadFromUrl(url: string): Promise<TrackerFile> {
    const response = await fetch(url);
    return await response.json() as TrackerFile;
}

function ingest(data: TrackerFile, overwrite = false): void {
    Object.entries(data.trackers).forEach(([domain, info]) => {
    if (!overwrite && TRACKER_MAP.has(domain)) return;
    TRACKER_MAP.set(domain, {
        domain,
        owner: info.o,
        category: mapToCategory(info.c),
    });
    });
}

// known tracker domains and their types detectetd in network requests
export async function initTrackerData(): Promise<void> {
// load core data (first badge)
    const coreUrl = chrome.runtime.getURL("src/data/tracker-core.json");
    const core = await loadFromUrl(coreUrl);
    ingest(core);
    console.debug(`Core loaded: ${TRACKER_MAP.size} trackers`);
    

    // load extended data (second badge, lazy load)
    loadFromUrl(chrome.runtime.getURL("src/data/tracker-extended.json"))
    .then((extended) => {
        ingest(extended);
        console.debug(`Extended loaded: ${TRACKER_MAP.size} total trackers`);

    })
    .catch((e) => console.debug("Extended konnte nicht geladen werden", e));

    // TODO: LOOKUP TEST, remove later
    const start = performance.now();
    const testResult = TRACKER_MAP.get("doubleclick.net");
    const elapsed = performance.now() - start;
    console.log(`[klartxt] Lookup-Test doubleclick.net: ${testResult?.category ?? "nicht gefunden"} | ${elapsed.toFixed(3)}ms`);
}




