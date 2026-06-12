import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./app/page";
import { PrivacyPage } from "./app/privacy/page";
import { ImprintPage } from "./app/imprint/page";
import { NotFoundPage } from "./app/not-found/page";
import { Layout } from "./app/layout";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/trackers" replace />} />
          <Route path="/trackers" element={<HomePage />} />
          <Route path="/cookies" element={<HomePage />} />
          <Route path="/privacy-policy" element={<HomePage />} />
          <Route path="/third-party" element={<HomePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/imprint" element={<ImprintPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
