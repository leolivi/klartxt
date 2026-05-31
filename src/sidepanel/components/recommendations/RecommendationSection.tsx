import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useTabDataContext } from "../../context/useTabDataContext";
import { RecommendationItem } from "./RecommendationItem";

export function RecommendationSection() {
  const { recommendations } = useTabDataContext();
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
                {recommendations.map(rec => <RecommendationItem key={rec.type} recommendation={rec} />)}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <Separator />
    </>
  );
}
