import { NETWORK_EXCLUSIONS } from "@/data/false-positive-list";
import { TRACKER_MAP, type TrackerInfo } from "@/data/tracking-domains";

interface HandleNetworkRequests {
  details: chrome.webRequest.OnBeforeRequestDetails;
  onTrackerDetected: (tracker: TrackerInfo) => void;
}

// detect subdomains
function extractRegistrableDomain(hostname: string): string {
  const parts = hostname.split(".");
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join(".");
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
