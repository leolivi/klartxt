import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivacyPage } from "./app/privacy/page";
import { ImprintPage } from "./app/imprint/page";
import { HomePage } from "./app/page";
import { Layout } from "./app/layout";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/imprint" element={<ImprintPage />} />
          <Route path="/*" element={<HomePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
