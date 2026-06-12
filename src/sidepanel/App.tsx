import { Header } from "./components/header/Header";
import { Footer } from "./components/footer/Footer";
import { TrackingResultsSection } from "./components/trackingResults/TrackingResultsSection";
import { RiskScoreSection } from "./components/riskScore/RiskScoreSection";
import { InsightSection } from "./components/insights/InsightSection";
import { RecommendationSection } from "./components/recommendations/RecommendationSection";
import { WarningBanner } from "./components/warningBanner/WarningBanner";
import { TabDataProvider } from "./context/TabDataContext";
import { TooltipProvider } from "./components/ui/tooltip";

function App() {
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
