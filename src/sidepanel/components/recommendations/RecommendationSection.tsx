import { Cookie, Info, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import type { Recommendation } from "@/utils/recommendations";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

const TYPE_ICON = {
  cookie:  Cookie,
  tracker: Shield,
  general: Info,
};

export function RecommendationSection({ recommendations }: { recommendations: Recommendation[] }) {
  const { t } = useTranslation();

  return (
    <>
      <div className="px-4">
        <Accordion type="single" collapsible defaultValue="recommendations">
          <AccordionItem value="recommendations">
            <AccordionTrigger className="hover:no-underline">
              <h3 className="text-h3 text-text">{t("recommendationSectionTitle")}</h3>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4">
                {recommendations.map(rec => {
                  const Icon = TYPE_ICON[rec.type];
                  return (
                    <div key={rec.type} className="flex items-start gap-2">
                      <Icon size={16} className="mt-0.5 shrink-0 text-primary" />
                      <p className="text-body text-start">{t(rec.textKey)}</p>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <Separator />
    </>
  );
}
