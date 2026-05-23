import { useEffect, useState } from "react";
import "./styles/App.css";
import { Header } from "./components/header/Header";

interface TabData {
  trackerCount: number;
  cookieCount: number;
  isPartialData: boolean; 
  riskScore: number;
}

interface TabDataMessage extends TabData {
  type: string;
  tabId: number;
}

function App() {
  const [data, setData] = useState<TabData>({ trackerCount: 0, cookieCount: 0, isPartialData: false, riskScore: 0});

  const isChromeExtension = typeof chrome !== "undefined" && !!chrome.tabs;

  useEffect(() => {
    async function fetchData() {
      if (!isChromeExtension) return;
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;
      chrome.runtime.sendMessage(
        { type: "GET_TAB_DATA", tabId: tab.id },
        (response: TabData) => {
          if (response) setData(response);
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
          if (tab?.id === message.tabId) {
            setData(message);
          }
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

  return (
    <div className="p-4">
      <Header />
      <div className="pt-20">
        {data.isPartialData && (
          <p>Tracker-Daten unvollständig. Seite neu laden für vollständigen Scan</p>
        )}
        <p>Tracker: {data.trackerCount}</p>
        <p>Cookies: {data.cookieCount}</p>
        <p>RiskScore: {data.riskScore}</p>
      </div>
    </div>
  );
}

export default App;