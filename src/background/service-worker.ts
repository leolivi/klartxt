/// <reference types="chrome" />

import { initTrackerData } from "@/data/trackers/tracking-domains";
import { handleNetworkRequests } from "./handlers/handle-network-requets";
import { handleCookies } from "./handlers/handle-cookies";
import { TrackerCache } from "./cache/tracker-cache";
import { handleDsgvo } from "./handlers/handle-dsgvo";
import { updateTabBadge } from "./handlers/update-badge";

initTrackerData();

export const cache = new TrackerCache();

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
    updateTabBadge(tabId);
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
        updateTabBadge(tabId);
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
        updateTabBadge(tabId);
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

const IGNORED_COOKIE_NAMES = new Set(["_cookie_test"]);

/* ---- CONSENT TIMING: Cookie Change Listener ---- */
chrome.cookies.onChanged.addListener((changeInfo) => {
  if (changeInfo.removed) return;
  if (IGNORED_COOKIE_NAMES.has(changeInfo.cookie.name)) return;

  // find active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    (async () => {
      const tab = tabs[0];
      if (tab?.id == null || tab.url == null) return;
  
      const tabId = tab.id;
      const timing = cache.getConsentTiming(tabId);
      // no banner shown
      if (timing?.bannerShownAt == null) return;
  
      // cookies set before user interacted?
      const cookie = changeInfo.cookie;
      // track violations (before consent)
      const tabDomain = new URL(tab.url).hostname.replace(/^www\./, "");
      cache.addCookieViolation(tabId, {
        name: cookie.name,
        domain: cookie.domain,
        setAt: Date.now(),
      }, tabDomain);

      // TODO: remove later
      const updated = cache.getConsentTiming(tabId);
      console.log(
        `[ConsentTiming] ${timing.interactedAt == null ? "BEFORE" : "AFTER"} consent |`,
        changeInfo.cookie.name,
        `| before: ${updated?.cookiesSetBeforeConsent.length}`,
        `| after: ${updated?.cookiesSetAfterConsent.length}`,
        `| interactedAt: ${timing.interactedAt != null ? new Date(timing.interactedAt).toISOString() : "null"}`,
      );
    })();
    return true;
  });
});

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
              updateTabBadge(message.tabId);
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
        consentTiming: cache.getConsentTiming(tabId),
        tabUrl: tab.url ?? "",
        onDsgvoChecked: (result) => {
          cache.setDsgvoResult(tabId, result);
          cache.recalculateOverallRiskScore(tabId);
          updateTabBadge(tabId);
          // TODO: remove later
          console.log(`DSGVO Checks:`, result);
          notifySidePanel(tabId);
        },
      });
    })();
    return true;
  }

  if (message.type === "CONSENT_BANNER_SHOWN" && _sender.tab?.id != null) {
    cache.setConsentTimingBannerShown(_sender.tab.id);
    return true;
  }

  if (message.type === "CONSENT_BANNER_INTERACTED" && _sender.tab?.id != null) {
    const tabId = _sender.tab.id;
    cache.setConsentTimingInteracted(tabId, async () => {
      const tab = await chrome.tabs.get(tabId);
      if (tab.url == null || tab.url.startsWith("chrome://")) return;

      // cookie refresh after consent (only one time)
      await handleCookies({
        tabUrl: tab.url,
        onCookiesDetected: (cookies) => {
          cache.setCookies(tabId, cookies);
          cache.recalculateOverallRiskScore(tabId);
          updateTabBadge(tabId);
          notifySidePanel(tabId);
          console.log(`Cookies after consent (${cookies.length} total):`, cookies);
        },
      });
    });
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