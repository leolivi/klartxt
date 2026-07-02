import { Button } from "@/sidepanel/components/ui/button";
import { Card } from "@/sidepanel/components/ui/card";
import { useIsDark } from "@/sidepanel/hooks/useIsDark";
import { useTranslation } from "react-i18next";

const heroLight = "/assets/img/hero_lm.svg";
const heroDark = "/assets/img/hero_dm.svg";
const CWS_URL = "https://chromewebstore.google.com/detail/klartxt/ppghpejbkefmjhnjgpodohadkfkecgam";

export function CTASection() {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const hero = isDark ? heroDark : heroLight;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 mb-10">
      <Card className="flex flex-col md:flex-row items-center hover:bg-surface-secondary gap-12 bg-surface-secondary p-6">
        <div className="hidden md:block shrink-0">
          <img src={hero} alt={t("websiteHeroImageAlt")} className="w-64 xl:w-80" />
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-h2 text-ink-strongest">{t("websiteCTATitle")}</h2>
            <p className="text-body text-ink-default">{t("websiteCTASubtitle")}</p>
          </div>
          <Button
            href={CWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant={"secondary"}
            size={"md"}
            className="text-ink-strong"
          >
            {t("websiteCTAButton")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
