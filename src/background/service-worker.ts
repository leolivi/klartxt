/// <reference types="chrome" />

import { initTrackerData } from "@/data/trackers/tracking-domains";
import { handleNetworkRequests } from "./handlers/handle-network-requets";
import { calculateTrackerRiskPageScore } from "@/utils/scoring/network-risk-score";
import { handleCookies } from "./handlers/handle-cookies";
import { calculateCookieRiskScore } from "@/utils/scoring/cookie-risk-score";
import { TrackerCache } from "./cache/tracker-cache";

initTrackerData();

const cache = new TrackerCache();

/* ---- NOTIFY SIDE PANEL ---- */
function notifySidePanel(tabId: number): void {
  const trackers = cache.getTrackerDetails(tabId);
  const cookies = cache.getCookieDetails(tabId);
  chrome.runtime.sendMessage({
    type: "TAB_DATA_UPDATED",
    tabId,
    trackerCount: trackers.length,
    cookieCount: cookies.length,
  }).catch((error) => {
    console.debug("Could not send message to tab", tabId, error);
  });
}

/* ---- SIDE PANEL ---- */
chrome.sidePanel
  .setPanelBehavior({openPanelOnActionClick: true})
  .catch((error) => console.debug(error));


/* ---- TAB UPDATE HANDLER ---- */
chrome.tabs.onUpdated.addListener(async(tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && changeInfo.url) {
    cache.reset(tabId);
  }

  if (changeInfo.status !== "complete") return;

  await cache.restoreFromStorage(tabId);

  /* ---- COOKIE HANDLER ---- */
  if (tab.url && !tab.url.startsWith("chrome://")) {
    await handleCookies({
      tabUrl: tab.url,
      onCookiesDetected: (cookies) => {
        cache.addCookies(tabId, cookies);
        const riskScore = calculateCookieRiskScore(cookies);
        notifySidePanel(tabId);
        // TODO: remove later
        console.log(`Cookies (${cookies.length} total):`, cookies, `Risk: ${riskScore}`);
      },
    });
  }
});

/* ---- NETWORK REQUEST HANDLER ---- */
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const tabId = details.tabId;
    if (tabId < 0) return undefined;

    // TODO: remove later
    const start = performance.now();

    handleNetworkRequests({
      details,
      onTrackerDetected: (tracker) => {
        cache.addTrackerDetail(tabId, tracker);
        const details = cache.getTrackerDetails(tabId);
        const trackerRiskPageScore = calculateTrackerRiskPageScore(details);
        notifySidePanel(tabId);
        // TODO: remove later
        const elapsed = performance.now() - start;
        console.log(`Tracker (${details.length} total):`, details, `${elapsed.toFixed(3)}ms`, trackerRiskPageScore);
      },
    });
    return undefined;
  },
  { urls: ["https://*/*", "http://*/*"] }
);

/* ---- MESSAGE HANDLER ---- */
// send info to sidepanel
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "PING") {
    sendResponse({ alive: true });
    return true;
  }

  if (message.type === "GET_TAB_DATA" && message.tabId != null) {
    (async () => {
      await cache.restoreFromStorage(message.tabId);

      // if cache is empty, reload cookie
      if (cache.getCookieDetails(message.tabId).length === 0) {
        const tab = await chrome.tabs.get(message.tabId);
        if (tab.url && !tab.url.startsWith("chrome://")) {
          await handleCookies({
            tabUrl: tab.url,
            onCookiesDetected: (cookies) => {
              cache.addCookies(message.tabId, cookies);
            },
          });
        }
      }

      const trackers = cache.getTrackerDetails(message.tabId);
      const cookies = cache.getCookieDetails(message.tabId);

      sendResponse({
        trackerCount: trackers.length,
        cookieCount: cookies.length,
        isPartialData: trackers.length === 0, // SW has been restarted
      });
    })();
    return true;
  }

  if (message.type === "RESET_CACHE" && message.tabId != null) {
    cache.clear(message.tabId);
    sendResponse({ success: true });
    return true;
  }
});

/* ---- TAB CLEANUP ---- */
chrome.tabs.onRemoved.addListener((tabId: number) => {
  cache.clear(tabId);
});