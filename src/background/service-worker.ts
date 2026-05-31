/// <reference types="chrome" />

import { initTrackerData } from "@/data/trackers/tracking-domains";
import { handleNetworkRequests } from "./handlers/handle-network-requets";
import { handleCookies } from "./handlers/handle-cookies";
import { TrackerCache } from "./cache/tracker-cache";
import { handleDsgvo } from "./handlers/handle-dsgvo";
import { updateTabBadge } from "./handlers/update-badge";
import { isSidePanelClosedError } from "./handlers/handle-errors";

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
    trackerList: trackers,
    cookieCount: cookies.length,
    cookiesList: cookies,
    isPartialData: !cache.isScanCompleted(tabId) || cache.isDataStale(tabId),
    riskScore: cache.getOverallRiskScore(tabId),
    dsgvoResult: cache.getDsgvoResult(tabId),
    scanDuration: cache.getScanDuration(tabId),
  }).catch((error) => {
    if (!isSidePanelClosedError(error)) console.warn("[notifySidePanel] sendMessage failed:", error);
  });
}

/* ---- UI UPDATE HANDLER ---- */
function handleUIUpdate(tabId: number): void {
  updateTabBadge(tabId);
  notifySidePanel(tabId);
}

// Set the UI update callback once
cache.setUIUpdateCallback(handleUIUpdate);

/* ---- SIDE PANEL ---- */
chrome.sidePanel
  .setPanelBehavior({openPanelOnActionClick: true})
  .catch((error) => console.warn("[sidePanel] setPanelBehavior failed:", error));


/* ---- TAB ACTIVATED HANDLER ---- */
let activatedDebounceTimer: ReturnType<typeof setTimeout> | undefined;

chrome.tabs.onActivated.addListener(({ tabId }) => {
  if (activatedDebounceTimer) clearTimeout(activatedDebounceTimer);
  activatedDebounceTimer = setTimeout(async () => {
    activatedDebounceTimer = undefined;

    await cache.restoreFromStorage(tabId);
    if (cache.isDataStale(tabId)) cache.invalidateScan(tabId);
    // show cached data immediately
    handleUIUpdate(tabId);

    let tab: chrome.tabs.Tab;
    try {
      tab = await chrome.tabs.get(tabId);
    } catch {
      return;
    }
    if (!tab.url || tab.url.startsWith("chrome://")) return;

    // fresh cookie scan
    await handleCookies({
      tabUrl: tab.url,
      onCookiesDetected: (cookies) => {
        cache.setCookies(tabId, cookies);
        cache.scheduleUIUpdate(tabId);
      },
    });

    // recompute DSGVO immediately with cached DOM result + fresh cookie/tracker data
    const contentResult = cache.getContentResult(tabId);
    if (contentResult != null) {
      handleDsgvo({
        contentResult,
        trackers: cache.getTrackerDetails(tabId),
        cookieCount: cache.getCookieDetails(tabId).length,
        consentTiming: cache.getConsentTiming(tabId),
        tabUrl: tab.url,
        onDsgvoChecked: (result) => {
          cache.setDsgvoResult(tabId, result);
          cache.scheduleUIUpdate(tabId);
        },
      });
    }

    // also request fresh DOM analysis from content script (best effort)
    chrome.tabs.sendMessage(tabId, { type: "RUN_DSGVO_CHECKS" }).catch((error) => {
      if (!isSidePanelClosedError(error)) console.warn("[onActivated] RUN_DSGVO_CHECKS failed:", error);
    });
  }, 150);
});

/* ---- TAB UPDATE HANDLER ---- */
chrome.tabs.onUpdated.addListener(async(tabId, changeInfo, tab) => {
  // Reset on any navigation (full page load or SPA URL change via History API)
  if (changeInfo.url) {
    cache.reset(tabId);
    updateTabBadge(tabId);
  }

  // SPA navigation: URL changed without a full reload (no status transition)
  if (changeInfo.url && changeInfo.status == null) {
    if (tab.url && !tab.url.startsWith("chrome://")) {
      cache.startScan(tabId);
      await handleCookies({
        tabUrl: tab.url,
        onCookiesDetected: (cookies) => {
          cache.setCookies(tabId, cookies);
          cache.scheduleUIUpdate(tabId);
        },
      });
    }
    return;
  }

  if (changeInfo.status !== "complete") return;

  await cache.restoreFromStorage(tabId);
  cache.startScan(tabId);

  /* ---- COOKIE HANDLER ---- */
  if (tab.url && !tab.url.startsWith("chrome://")) {
    await handleCookies({
      tabUrl: tab.url,
      onCookiesDetected: (cookies) => {
        cache.setCookies(tabId, cookies);
        cache.scheduleUIUpdate(tabId);
        // TODO: remove later
        console.log(`Cookies (${cookies.length} total):`, cookies, `Risk: ${cache.getOverallRiskScore(tabId)}`);
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
        cache.scheduleUIUpdate(tabId);
        // TODO: remove later
        const elapsed = performance.now() - start;
        const trackers = cache.getTrackerDetails(tabId);
        console.log(
          `Tracker (${trackers.length} total):`,
          trackers,
          `${elapsed.toFixed(3)}ms`,
          `Risk: ${cache.getOverallRiskScore(tabId)}`,
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

      const isStale = cache.isDataStale(message.tabId);
      if (isStale) cache.invalidateScan(message.tabId);

      if (isStale || cache.getCookieDetails(message.tabId).length === 0) {
        let tab: chrome.tabs.Tab;
        try {
          tab = await chrome.tabs.get(message.tabId);
        } catch {
          sendResponse({ trackerCount: 0, cookieCount: 0, isPartialData: true, riskScore: 0 });
          return;
        }
        if (tab.url && !tab.url.startsWith("chrome://")) {
          await handleCookies({
            tabUrl: tab.url,
            onCookiesDetected: (cookies) => {
              cache.setCookies(message.tabId, cookies);
              cache.scheduleUIUpdate(message.tabId);
            },
          });
          chrome.tabs.sendMessage(message.tabId, { type: "RUN_DSGVO_CHECKS" }).catch((error) => {
            if (!isSidePanelClosedError(error)) console.warn("[GET_TAB_DATA] RUN_DSGVO_CHECKS failed:", error);
          });
        }
      }

      const trackers = cache.getTrackerDetails(message.tabId);
      const cookies = cache.getCookieDetails(message.tabId);
      const riskScore = cache.getOverallRiskScore(message.tabId);

      sendResponse({
        trackerCount: trackers.length,
        trackerList: trackers,
        cookieCount: cookies.length,
        cookiesList: cookies,
        isPartialData: !cache.isScanCompleted(message.tabId),
        riskScore,
        dsgvoResult: cache.getDsgvoResult(message.tabId),
        scanDuration: cache.getScanDuration(message.tabId),
      });
    })();
    return true;
  }


  if (message.type === "DSGVO_CHECKS_RESULT" && _sender.tab?.id != null) {
    (async () => {
      const tabId = _sender.tab!.id!;
      let tab: chrome.tabs.Tab;
      try {
        tab = await chrome.tabs.get(tabId);
      } catch {
        return;
      }

      cache.setContentResult(tabId, message.result);
      handleDsgvo({
        contentResult: message.result,
        trackers: cache.getTrackerDetails(tabId),
        cookieCount: cache.getCookieDetails(tabId).length,
        consentTiming: cache.getConsentTiming(tabId),
        tabUrl: tab.url ?? "",
        onDsgvoChecked: (result) => {
          cache.setDsgvoResult(tabId, result);
          cache.scheduleUIUpdate(tabId);
          // TODO: remove later
          console.log(`DSGVO Checks:`, result);
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
      let tab: chrome.tabs.Tab;
      try {
        tab = await chrome.tabs.get(tabId);
      } catch {
        return;
      }
      if (tab.url == null || tab.url.startsWith("chrome://")) return;

      // cookie refresh after consent (only one time)
      await handleCookies({
        tabUrl: tab.url,
        onCookiesDetected: (cookies) => {
          cache.setCookies(tabId, cookies);
          cache.scheduleUIUpdate(tabId);
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