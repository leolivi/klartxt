import { useTranslation } from "react-i18next"
import { useTabDataContext } from "../../context/useTabDataContext"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { Button } from "../ui/button"
import { InsightItem } from "./InsightItem"

export function InsightSection() {
  const { insights } = useTabDataContext()
  const { t } = useTranslation()
  const issueCount = insights.filter((i) => i.severity !== "fine").length

  const badgeText =
    issueCount === 0
      ? t("insightSectionBadge_zero")
      : issueCount === 1
        ? t("insightSectionBadge_one")
        : t("insightSectionBadge_other", { count: issueCount })

  return (
    <div className="p-4">
      <Accordion type="single" collapsible cardAccordion>
        <AccordionItem value="insights">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <h3 className="text-h3 text-ink-strongest">
                {t("insightSectionTitle")}
              </h3>
              <Button
                variant={"secondary"}
                size="xs"
                interactive={false}
                asChild
              >
                <span>{badgeText}</span>
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              {insights.map((insight) => (
                <InsightItem key={insight.type} insight={insight} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
