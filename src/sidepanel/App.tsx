import { useEffect, useState } from "react";
import "./styles/App.css";
import { Header } from "./components/header/Header";
import { Footer } from "./components/footer/Footer";
import { TrackingResultsCard } from "./components/trackingResults/TrackingResultsCard";
import { RiskScore } from "./components/riskScore/RiskScore";
import { InsightSection } from "./components/insights/InsightSection";
import { RecommendationSection } from "./components/recommendations/RecommendationSection";
import type { DsgvoResult } from "@/utils/types/dsgvo-types";
import type { TrackerInfo } from "@/utils/types/tracking-enums";
import type { ClassifiedCookie } from "@/utils/types/cookie-types";
import { deriveInsights } from "@/utils/insights";
import { deriveRecommendations } from "@/utils/recommendations";

interface TabData {
  trackerCount: number;
  trackerList: TrackerInfo[];
  cookieCount: number;
  cookiesList: ClassifiedCookie[];
  isPartialData: boolean;
  riskScore: number;
  dsgvoResult: DsgvoResult | null;
  scanDuration: number | null;
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

// TODO: outsource logic from ui

function App() {
  const [data, setData] = useState<TabData>({ trackerCount: 0, trackerList: [], cookieCount: 0, cookiesList: [], isPartialData: false, riskScore: 0, dsgvoResult: null, scanDuration: null });
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
        <TrackingResultsCard tracker={data.trackerCount} trackerList={data.trackerList} cookies={data.cookieCount} cookiesList={data.cookiesList} dsgvoResult={data.dsgvoResult} />
        <InsightSection insights={deriveInsights(data.trackerList, data.cookiesList, data.dsgvoResult)} />
        <RecommendationSection recommendations={deriveRecommendations(data.trackerList, data.cookiesList, data.dsgvoResult, data.riskScore)} />

        <Footer scanDuration={data.scanDuration} />

    </div>
  );
}

export default App;