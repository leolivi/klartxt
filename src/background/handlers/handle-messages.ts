/// <reference types="chrome" />

import type { ContentScriptDsgvoResult } from "@/utils/types/dsgvo-types";
import type { TrackerCache } from "../cache/tracker-cache";
import { handleCookies } from "./handle-cookies";
import { handleDsgvo } from "./handle-dsgvo";
import { isSidePanelClosedError } from "./handle-errors";

// Structural type covering every field any handler below actually reads.
// Individual messages only populate the fields relevant to their `type`.
interface ExtensionMessage {
  type: string;
  tabId?: number;
  result?: ContentScriptDsgvoResult;
}

type MessageHandler = (
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
) => boolean;

function handleGetTabData(cache: TrackerCache): MessageHandler {
  return (message, _sender, sendResponse) => {
    if (message.tabId == null) return false;
    const tabId = message.tabId;

    (async () => {
      await cache.restoreFromStorage(tabId);

      const isStale = cache.isDataStale(tabId);
      if (isStale) cache.invalidateScan(tabId);

      if (isStale || cache.getCookieDetails(tabId).length === 0) {
        let tab: chrome.tabs.Tab;
        try {
          tab = await chrome.tabs.get(tabId);
        } catch {
          sendResponse({
            trackerCount: 0,
            cookieCount: 0,
            isPartialData: true,
            riskScore: 0,
          });
          return;
        }
        if (tab.url && !tab.url.startsWith("chrome://")) {
          await handleCookies({
            tabUrl: tab.url,
            thirdPartyCookies: cache.getThirdPartyCookieSightings(tabId),
            onCookiesDetected: cookies => {
              cache.setCookies(tabId, cookies);
              cache.scheduleUIUpdate(tabId);
            },
          });
          chrome.tabs.sendMessage(tabId, { type: "RUN_DSGVO_CHECKS" }).catch(error => {
            if (!isSidePanelClosedError(error)) console.warn("[GET_TAB_DATA] RUN_DSGVO_CHECKS failed:", error);
          });
        }
      }

      const trackers = cache.getTrackerDetails(tabId);
      const cookies = cache.getCookieDetails(tabId);
      const riskScore = cache.getOverallRiskScore(tabId);

      sendResponse({
        trackerCount: trackers.length,
        trackerList: trackers,
        cookieCount: cookies.length,
        cookiesList: cookies,
        isPartialData: !cache.isScanCompleted(tabId),
        riskScore,
        dsgvoResult: cache.getDsgvoResult(tabId),
        scanDuration: cache.getScanDuration(tabId),
      });
    })();

    return true;
  };
}

function handleDsgvoChecksResult(cache: TrackerCache): MessageHandler {
  return (message, sender) => {
    if (sender.tab?.id == null || message.result == null) return false;
    const tabId = sender.tab.id;
    const contentResult = message.result;

    (async () => {
      let tab: chrome.tabs.Tab;
      try {
        tab = await chrome.tabs.get(tabId);
      } catch {
        return;
      }

      cache.setContentResult(tabId, contentResult);
      handleDsgvo({
        contentResult,
        trackers: cache.getTrackerDetails(tabId),
        cookieCount: cache.getCookieDetails(tabId).length,
        consentTiming: cache.getConsentTiming(tabId),
        tabUrl: tab.url ?? "",
        clientHintsDetected: cache.getClientHintsDetected(tabId),
        onDsgvoChecked: result => {
          cache.setDsgvoResult(tabId, result);
          cache.scheduleUIUpdate(tabId);
          // console.debug(`DSGVO Checks:`, result);
        },
      });
    })();

    return true;
  };
}

function handleConsentBannerShown(cache: TrackerCache): MessageHandler {
  return (_message, sender) => {
    if (sender.tab?.id == null) return false;
    cache.setConsentTimingBannerShown(sender.tab.id);
    return true;
  };
}

function handleConsentBannerInteracted(cache: TrackerCache): MessageHandler {
  return (_message, sender) => {
    if (sender.tab?.id == null) return false;
    const tabId = sender.tab.id;

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
        thirdPartyCookies: cache.getThirdPartyCookieSightings(tabId),
        onCookiesDetected: cookies => {
          cache.setCookies(tabId, cookies);
          cache.scheduleUIUpdate(tabId);
          // console.debug(`Cookies after consent (${cookies.length} total):`, cookies);
        },
      });
    });

    return true;
  };
}

export function createMessageHandlers(cache: TrackerCache): Record<string, MessageHandler> {
  return {
    GET_TAB_DATA: handleGetTabData(cache),
    DSGVO_CHECKS_RESULT: handleDsgvoChecksResult(cache),
    CONSENT_BANNER_SHOWN: handleConsentBannerShown(cache),
    CONSENT_BANNER_INTERACTED: handleConsentBannerInteracted(cache),
  };
}
