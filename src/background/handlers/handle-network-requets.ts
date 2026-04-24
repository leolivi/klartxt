import { NETWORK_EXCLUSIONS } from "@/data/trackers/false-positive-list";
import { TRACKER_MAP, type TrackerInfo } from "@/data/trackers/tracking-domains";

interface HandleNetworkRequests {
  details: chrome.webRequest.OnBeforeRequestDetails;
  onTrackerDetected: (tracker: TrackerInfo) => void;
}

const registrableDomainCache = new Map<string, string>();

// detect subdomains
function extractRegistrableDomain(hostname: string): string {
  if (registrableDomainCache.has(hostname)) {
    return registrableDomainCache.get(hostname)!;
  }
  const parts = hostname.split(".");
  const result = parts.length <= 2 ? hostname : parts.slice(-2).join(".");
  registrableDomainCache.set(hostname, result);
  return result;
}

// function to handle network request tracking
export function handleNetworkRequests({
  details,
  onTrackerDetected,
}: HandleNetworkRequests): void {
  let url: URL;

  try {
    url = new URL(details.url);
  } catch {
    return;
  }

  // check if request is a tracker
  const domain = url.hostname.replace(/^www\./, "");
  if (NETWORK_EXCLUSIONS.has(domain)) return;

  const registrable = extractRegistrableDomain(domain);

  const tracker = TRACKER_MAP.get(domain) ?? 
  (domain !== registrable ? TRACKER_MAP.get(registrable) : undefined);
  if (!tracker) return;

  // increment in memory counter of trackers
  onTrackerDetected(tracker);
}
