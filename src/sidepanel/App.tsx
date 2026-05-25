import { useEffect, useState } from "react";
import "./styles/App.css";
import { Header } from "./components/header/Header";
import LanguageSwitcher from "./components/languageSwitcher/LanguageSwitcher";
import { RiskScore } from "./components/riskScore/RiskScore";

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

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function App() {
  const [data, setData] = useState<TabData>({ trackerCount: 0, cookieCount: 0, isPartialData: false, riskScore: 0 });
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
    <div>
        <Header domain={domain} isPartialData={data.isPartialData} isLoaded={isLoaded} />
        <RiskScore score={data.riskScore}/>
      <div className="pt-20">
        <p>Tracker: {data.trackerCount}</p>
        <p>Cookies: {data.cookieCount}</p>
        <p>RiskScore: {data.riskScore}</p>
      </div>
      <div className="pt-10">
        <LanguageSwitcher /> {/* TODO: Move to Footer */}
      </div>
    </div>
  );
}

export default App;