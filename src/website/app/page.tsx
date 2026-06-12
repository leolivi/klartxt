import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/sidepanel/components/ui/tabs";
import { CHECKED_ITEMS, type CheckedItemKey } from "@/utils/types/footer-types";
import { TopicPage } from "./topic/page";
import { useEffect, useState } from "react";
import hero from '../../../public/img/hero.svg'

const ROUTES: Record<CheckedItemKey, string> = {
  tracker:       "/trackers",
  cookies:       "/cookies",
  privacyPolicy: "/privacy-policy",
  thirdParty:    "/third-party",
};

const PATH_TO_KEY = Object.fromEntries(
  Object.entries(ROUTES).map(([k, v]) => [v, k as CheckedItemKey])
);

export function HomePage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const activeKey = PATH_TO_KEY[location.pathname] ?? CHECKED_ITEMS[0].key;

  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 640px)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <main className="flex">
      <div className="py-12 hidden md:block">
        <img src={hero} alt={t("websiteHeroImageAlt")} />
      </div>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-h1 mb-2">{t("websiteHeroTitle")}</h1>
          <p className="text-body text-muted">{t("websiteHeroSubtitle")}</p>
        </div>
        <Tabs
          value={activeKey}
          onValueChange={(key) => navigate(ROUTES[key as CheckedItemKey])}
          className="mb-8"
          orientation={isDesktop ? "horizontal" : "vertical"}
        >
          <TabsList>
            {CHECKED_ITEMS.map(({ key }) => (
              <TabsTrigger key={key} value={key}>
                {t(`website_${key}_title`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <TopicPage topicKey={activeKey} />
      </div>
    </main>
  );
}
