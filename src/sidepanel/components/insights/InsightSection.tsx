import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import type { Insight, InsightSeverity } from "@/utils/insights";
import { Button } from "../ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

const SEVERITY_ICON = {
  fine:      { Icon: CircleCheck, className: "bg-risk-low-fill text-risk-low-text rounded-full" },
  suspicious: { Icon: CircleAlert, className: "bg-risk-medium-fill text-risk-medium-text rounded-full" },
  confirmed:  { Icon: CircleX,    className: "bg-risk-high-fill text-risk-high-text rounded-full" },
} satisfies Record<InsightSeverity, { Icon: React.FC<{ size?: number; className?: string }>; className: string }>;

const BADGE_VARIANT: Record<InsightSeverity, "secondaryGreen" | "secondaryOrange" | "secondaryRed"> = {
  fine:       "secondaryGreen",
  suspicious: "secondaryOrange",
  confirmed:  "secondaryRed",
};

function maxSeverity(insights: Insight[]): InsightSeverity {
  if (insights.some(i => i.severity === "confirmed")) return "confirmed";
  if (insights.some(i => i.severity === "suspicious")) return "suspicious";
  return "fine";
}

export function InsightSection({ insights }: { insights: Insight[] }) {
  const { t } = useTranslation();
  const issueCount = insights.filter(i => i.severity !== "fine").length;
  const severity = maxSeverity(insights);

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
                {insights.map(insight => {
                  const { Icon, className } = SEVERITY_ICON[insight.severity];
                  return (
                    <div key={insight.type} className="flex items-start gap-2">
                      <Icon size={16} className={`mt-0.5 shrink-0 ${className}`} />
                      <p className="text-body text-start">{t(insight.textKey, insight.vars)}</p>
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
