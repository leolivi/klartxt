import { TRACKER_MAP, type TrackerInfo } from "@/data/tracking-domains";


interface HandleNetworkRequests {
  details: chrome.webRequest.OnBeforeRequestDetails;
  trackersCache: Set<string>;
  onTrackerDetected: (tracker: TrackerInfo) => void;
  }

// function to handle network request tracking
export function handleNetworkRequests({
  details,
  trackersCache,
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
  const tracker = TRACKER_MAP.get(domain);
  if (!tracker) return;
  if (trackersCache.has(domain)) return;

  // increment in memory counter of trackers
  trackersCache.add(domain);
  onTrackerDetected(tracker);
}
