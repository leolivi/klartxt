import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/sidepanel/components/ui/tabs";
import type { CheckedItemKey } from "@/utils/types/footer-types";
import { TopicPage } from "./topic/page";
import { useEffect, useState } from "react";
import hero from '../../../public/assets/img/hero.svg'
import { HeroBanner } from "../utils/glow"

const VIDEO_SRC = "/assets/video/Klartxt_Privacy_Explained.mp4";

const WEBSITE_TABS = [
  { key: "tracker" },
  { key: "cookies" },
  { key: "privacyPolicy" },
  { key: "video" },
] as const;

type WebsiteTabKey = typeof WEBSITE_TABS[number]["key"];

const ROUTES: Record<WebsiteTabKey, string> = {
  tracker:       "/trackers",
  cookies:       "/cookies",
  privacyPolicy: "/privacy-policy",
  video:         "/video",
};

const PATH_TO_KEY = Object.fromEntries(
  Object.entries(ROUTES).map(([k, v]) => [v, k as WebsiteTabKey])
);

export function HomePage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const activeKey: WebsiteTabKey = PATH_TO_KEY[location.pathname] ?? WEBSITE_TABS[0].key;

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
    <main>
      <HeroBanner />
      <div className="flex">
        <div className="py-12 hidden lg:block">
          <img src={hero} alt={t("websiteHeroImageAlt")} />
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-h1 mb-2">{t("websiteHeroTitle")}</h1>
            <p className="text-body text-muted">{t("websiteHeroSubtitle")}</p>
          </div>
          <Tabs
            value={activeKey}
            onValueChange={(key) => navigate(ROUTES[key as WebsiteTabKey])}
            className="mb-4"
            orientation={isDesktop ? "horizontal" : "vertical"}
          >
            <TabsList>
              {WEBSITE_TABS.map(({ key }) => (
                <TabsTrigger key={key} value={key}>
                  {t(`website_${key}_title`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {activeKey === "video" ? (
            <div>
              <video src={VIDEO_SRC} controls className="w-full rounded-lg" />
              <p className="text-xs text-muted mt-2">{t("websiteVideoCaption")}</p>
            </div>
          ) : (
            <TopicPage topicKey={activeKey as CheckedItemKey} />
          )}
        </div>
      </div>
    </main>
  );
}
