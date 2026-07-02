import type { Insight } from "@/utils/insights";
import type { Recommendation } from "@/utils/recommendations";
import type { TabData } from "@/utils/types/tab-types";
import { createContext } from "react";

export interface TabDataContextValue extends TabData {
  domain: string;
  isLoaded: boolean;
  lastScanned: Date | null;
  insights: Insight[];
  recommendations: Recommendation[];
}

export const TabDataContext = createContext<TabDataContextValue | null>(null);
