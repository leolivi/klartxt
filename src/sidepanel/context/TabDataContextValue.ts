import { createContext } from "react";
import type { Insight } from "@/utils/insights";
import type { Recommendation } from "@/utils/recommendations";
import type { TabData } from "@/utils/types/tab-types";

export interface TabDataContextValue extends TabData {
  domain: string;
  isLoaded: boolean;
  insights: Insight[];
  recommendations: Recommendation[];
}

export const TabDataContext = createContext<TabDataContextValue | null>(null);
