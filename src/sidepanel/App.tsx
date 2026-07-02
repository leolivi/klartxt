import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "./components/footer/Footer";
import { Header } from "./components/header/Header";
import { InsightSection } from "./components/insights/InsightSection";
import { RecommendationSection } from "./components/recommendations/RecommendationSection";
import { RiskScoreSection } from "./components/riskScore/RiskScoreSection";
import { TrackingResultsSection } from "./components/trackingResults/TrackingResultsSection";
import { TooltipProvider } from "./components/ui/tooltip";
import { WarningBanner } from "./components/warningBanner/WarningBanner";
import { TabDataProvider } from "./context/TabDataContext";

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <TooltipProvider>
      <TabDataProvider>
        <Header />
        <WarningBanner />
        <main className="pb-16">
          <RiskScoreSection />
          <TrackingResultsSection />
          <InsightSection />
          <RecommendationSection />
        </main>
        <Footer />
      </TabDataProvider>
    </TooltipProvider>
  );
}

export default App;
