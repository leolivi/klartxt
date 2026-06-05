import type { ReactNode } from "react";
import { useTabData } from "../hooks/useTabData";
import { inferInsights } from "@/utils/insights";
import { inferRecommendations } from "@/utils/recommendations";
import { TabDataContext } from "./TabDataContextValue";

export function TabDataProvider({ children }: { children: ReactNode }) {
  const { data, domain, isLoaded } = useTabData();

  const insights = inferInsights(data.trackerList, data.cookiesList, data.dsgvoResult);
  const recommendations = inferRecommendations(data.trackerList, data.cookiesList, data.dsgvoResult, data.riskScore);

  return (
    <TabDataContext.Provider value={{ ...data, domain, isLoaded, insights, recommendations }}>
      {children}
    </TabDataContext.Provider>
  );
}
