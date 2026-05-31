import { useEffect, useState } from "react";
import { extractDomain } from "@/utils/domain";
import type { TabData, TabDataMessage } from "@/utils/types/tab-types";

const DEFAULT_TAB_DATA: TabData = {
  trackerCount: 0,
  trackerList: [],
  cookieCount: 0,
  cookiesList: [],
  isPartialData: false,
  riskScore: 0,
  dsgvoResult: null,
  scanDuration: null,
};

export function useTabData() {
  const [data, setData] = useState<TabData>(DEFAULT_TAB_DATA);
  const [domain, setDomain] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const isChromeExtension = typeof chrome !== "undefined" && !!chrome.tabs;

  useEffect(() => {
    async function fetchData() {
      if (!isChromeExtension) return;
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;
      setIsLoaded(false);
      setDomain(extractDomain(tab.url ?? ""));
      chrome.runtime.sendMessage(
        { type: "GET_TAB_DATA", tabId: tab.id },
        (response: TabData) => {
          if (response) {
            setData(response);
            setIsLoaded(true);
          }
        }
      );
    }

    fetchData();

    if (!isChromeExtension) return;

    const handleActivated = () => fetchData();
    const handleUpdated = (_tabId: number, changeInfo: { status?: string }) => {
      if (changeInfo.status === "complete") fetchData();
    };
    const handleMessage = (message: TabDataMessage) => {
      if (message.type === "TAB_DATA_UPDATED") {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
          if (tab?.id === message.tabId) setData(message);
        });
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchData();
    };

    chrome.tabs.onActivated.addListener(handleActivated);
    chrome.tabs.onUpdated.addListener(handleUpdated);
    chrome.runtime.onMessage.addListener(handleMessage);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      chrome.tabs.onActivated.removeListener(handleActivated);
      chrome.tabs.onUpdated.removeListener(handleUpdated);
      chrome.runtime.onMessage.removeListener(handleMessage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isChromeExtension]);

  return { data, domain, isLoaded };
}
