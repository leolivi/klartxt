import { useTranslation } from 'react-i18next';
import { Header } from "../components/header/Header";
import { Footer } from "../components/footer/Footer";
import { Separator } from "@/sidepanel/components/ui/separator";

export function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      <Header />
      <Separator />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-h1 mb-2">{t("privacyPage_title")}</h1>
        <p className="text-small text-muted mb-10">{t("privacyPage_lastUpdated")}</p>

        <section className="mb-8">
          <h2 className="text-h2 mb-3">{t("privacyPage_overview_title")}</h2>
          <p className="text-body text-muted">{t("privacyPage_overview_body")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-h2 mb-3">{t("privacyPage_dataCollection_title")}</h2>
          <p className="text-body text-muted">{t("privacyPage_dataCollection_body")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-h2 mb-3">{t("privacyPage_localProcessing_title")}</h2>
          <p className="text-body text-muted">{t("privacyPage_localProcessing_body")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-h2 mb-3">{t("privacyPage_permissions_title")}</h2>
          <p className="text-body text-muted mb-3">{t("privacyPage_permissions_intro")}</p>
          <ul className="text-body text-muted list-disc pl-5 space-y-1">
            <li>{t("privacyPage_permissions_network")}</li>
            <li>{t("privacyPage_permissions_tabs")}</li>
            <li>{t("privacyPage_permissions_storage")}</li>
            <li>{t("privacyPage_permissions_cookies")}</li>
            <li>{t("privacyPage_permissions_sidepanel")}</li>
          </ul>
          <p className="text-body text-muted mt-3">{t("privacyPage_permissions_outro")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-h2 mb-3">{t("privacyPage_noThirdParty_title")}</h2>
          <ul className="text-body text-muted list-disc pl-5 space-y-1">
            <li>{t("privacyPage_noThirdParty_analytics")}</li>
            <li>{t("privacyPage_noThirdParty_remoteCode")}</li>
            <li>{t("privacyPage_noThirdParty_ads")}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-h2 mb-3">{t("privacyPage_changes_title")}</h2>
          <p className="text-body text-muted">{t("privacyPage_changes_body")}</p>
        </section>
      </main>
      <Separator />
      <Footer />
    </div>
  );
}
