import type { ReactNode } from "react";
import { useTabData } from "../hooks/useTabData";
import { deriveInsights } from "@/utils/insights";
import { deriveRecommendations } from "@/utils/recommendations";
import { TabDataContext } from "./TabDataContextValue";

export function TabDataProvider({ children }: { children: ReactNode }) {
  const { data, domain, isLoaded } = useTabData();

  const insights = deriveInsights(data.trackerList, data.cookiesList, data.dsgvoResult);
  const recommendations = deriveRecommendations(data.trackerList, data.cookiesList, data.dsgvoResult, data.riskScore);

  return (
    <TabDataContext.Provider value={{ ...data, domain, isLoaded, insights, recommendations }}>
      {children}
    </TabDataContext.Provider>
  );
}
