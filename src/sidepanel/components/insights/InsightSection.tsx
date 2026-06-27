import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useTabDataContext } from "../../context/useTabDataContext";
import { maxSeverity } from "@/utils/insights";
import { BADGE_VARIANT } from "./insightConfig";
import { InsightItem } from "./InsightItem";

export function InsightSection() {
  const { insights } = useTabDataContext();
  const { t } = useTranslation();
  const severity = maxSeverity(insights);
  const issueCount = insights.filter(i => i.severity !== "fine").length;

  const badgeText =
    issueCount === 0 ? t("insightSectionBadge_zero")
    : issueCount === 1 ? t("insightSectionBadge_one")
    : t("insightSectionBadge_other", { count: issueCount });

  return (

      <div className="p-4">
        <Accordion type="single" collapsible className="bg-surface-secondary rounded-[15px] border-b-0 px-3">
          <AccordionItem value="insights">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <h3 className="text-h3 text-ink-strongest">{t("insightSectionTitle")}</h3>
                <Button variant={BADGE_VARIANT[severity]} size="xs" interactive={false} asChild>
                  <span>{badgeText}</span>
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4">
                {insights.map(insight => <InsightItem key={insight.type} insight={insight} />)}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

  );
}
