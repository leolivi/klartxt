/// <reference types="chrome" />

import { initTrackerData } from "@/data/trackers/tracking-domains";
import { handleNetworkRequests } from "./handlers/handle-network-requets";
import { handleCookies } from "./handlers/handle-cookies";
import { TrackerCache } from "./cache/tracker-cache";
import { handleDsgvo } from "./handlers/handle-dsgvo";

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
    isPartialData: trackers.length === 0,
    riskScore: cache.getOverallRiskScore(tabId),
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
        cache.setCookies(tabId, cookies);
        const riskScore = cache.recalculateOverallRiskScore(tabId);
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
      onTrackerDetected: (result) => {
        cache.setTrackerDetail(tabId, result.tracker);
        const trackers = cache.getTrackerDetails(tabId);
        const riskScore = cache.recalculateOverallRiskScore(tabId);
        notifySidePanel(tabId);
        // TODO: remove later
         const elapsed = performance.now() - start;
          console.log(
            `Tracker (${trackers.length} total):`,
            trackers,
            `${elapsed.toFixed(3)}ms`,
            `Risk: ${riskScore}`,
            result.confidence,
          );
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
              cache.setCookies(message.tabId, cookies);
              cache.recalculateOverallRiskScore(message.tabId);
            },
          });
        }
      }

      const trackers = cache.getTrackerDetails(message.tabId);
      const cookies = cache.getCookieDetails(message.tabId);
      const riskScore = cache.getOverallRiskScore(message.tabId)

      sendResponse({
        trackerCount: trackers.length,
        cookieCount: cookies.length,
        isPartialData: trackers.length === 0, // SW has been restarted
        riskScore: riskScore
      });
    })();
    return true;
  }


  if (message.type === "DSGVO_CHECKS_RESULT" && _sender.tab?.id != null) {
  (async () => {
    const tabId = _sender.tab!.id!;
    const tab = await chrome.tabs.get(tabId);

    handleDsgvo({
      contentResult: message.result,
      trackers: cache.getTrackerDetails(tabId),
      cookieCount: cache.getCookieDetails(tabId).length,
      tabUrl: tab.url ?? "",
      onDsgvoChecked: (result) => {
        cache.setDsgvoResult(tabId, result);
        // TODO: remove later
        console.log(`DSGVO Checks:`, result);
        notifySidePanel(tabId);
      },
      // TODO: remove later
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