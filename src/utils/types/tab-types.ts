import type { ClassifiedCookie } from "./cookie-types";
import type { DsgvoResult } from "./dsgvo-types";
import type { TrackerInfo } from "./tracking-enums";

export interface TabData {
  trackerCount: number;
  trackerList: TrackerInfo[];
  cookieCount: number;
  cookiesList: ClassifiedCookie[];
  isPartialData: boolean;
  riskScore: number;
  dsgvoResult: DsgvoResult | null;
  scanDuration: number | null;
}

export interface TabDataMessage extends TabData {
  type: string;
  tabId: number;
}
