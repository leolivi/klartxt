import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
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
    <>
      <div className="px-4">
        <Accordion type="single" collapsible defaultValue="insights">
          <AccordionItem value="insights">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <h3 className="text-h3 text-text">{t("insightSectionTitle")}</h3>
                <Button variant={BADGE_VARIANT[severity]} size="xs" interactive={false}>
                  {badgeText}
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
      <Separator />
    </>
  );
}
