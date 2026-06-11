import { Header } from "./components/header/Header";
import { Footer } from "./components/footer/Footer";
import { TrackingResultsSection } from "./components/trackingResults/TrackingResultsSection";
import { RiskScoreSection } from "./components/riskScore/RiskScoreSection";
import { InsightSection } from "./components/insights/InsightSection";
import { RecommendationSection } from "./components/recommendations/RecommendationSection";
import { WarningBanner } from "./components/warningBanner/WarningBanner";
import { TabDataProvider } from "./context/TabDataContext";

function App() {
  return (
    <TabDataProvider>
        <Header />
        <WarningBanner />
        <RiskScoreSection />
        <TrackingResultsSection />
        <InsightSection />
        <RecommendationSection />
        <Footer />
    </TabDataProvider>
  );
}

export default App;
