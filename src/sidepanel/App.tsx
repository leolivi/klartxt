import { useEffect, useState } from "react";
import "./styles/App.css";
import logoLight from "../../public/img/logo/Klartxt_logo_lm.svg";
import logoDark from "../../public/img/logo/Klartxt_logo_dm.svg";

interface TabData {
  trackerCount: number;
  cookieCount: number;
  isPartialData: boolean; 
}

function App() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const logo = isDark ? logoDark : logoLight;
  const [data, setData] = useState<TabData>({ trackerCount: 0, cookieCount: 0, isPartialData: false, });

  async function fetchData() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    chrome.runtime.sendMessage(
      { type: "GET_TAB_DATA", tabId: tab.id },
      (response: TabData) => {
        if (response) setData(response);
      }
    );
  }

  useEffect(() => {
  fetchData();

  const handleActivated = () => fetchData();
  const handleUpdated = (_tabId: number, changeInfo: { status?: string }) => {
    if (changeInfo.status === "complete") fetchData();
  };
  const handleMessage = (message: { type: string; tabId: number; trackerCount: number; cookieCount: number; isPartialData: boolean }) => {
    if (message.type === "TAB_DATA_UPDATED") {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab?.id === message.tabId) {
          setData({
            trackerCount: message.trackerCount,
            cookieCount: message.cookieCount,
            isPartialData: message.isPartialData ?? false,
          });
        }
      });
    }
  };

  chrome.tabs.onActivated.addListener(handleActivated);
  chrome.tabs.onUpdated.addListener(handleUpdated);
  chrome.runtime.onMessage.addListener(handleMessage);

  return () => {
    chrome.tabs.onActivated.removeListener(handleActivated);
    chrome.tabs.onUpdated.removeListener(handleUpdated);
    chrome.runtime.onMessage.removeListener(handleMessage);
  };
}, []);

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <h1>Klartxt</h1>
          <img src={logo} alt="Klartxt logo" />
        </div>
      </div>
      <div>
        {data.isPartialData && (
          <p>Tracker-Daten unvollständig. Seite neu laden für vollständigen Scan</p>
        )}
        <p>Tracker: {data.trackerCount}</p>
        <p>Cookies: {data.cookieCount}</p>
      </div>
    </>
  );
}

export default App;