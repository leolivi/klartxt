import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import { Info } from "lucide-react";


const LEVEL_COLORS: Record<number, string> = {
  1: "bg-risk-low-fill text-risk-low-text",
  2: "bg-risk-low-fill text-risk-low-text",
  3: "bg-risk-medium-fill text-risk-medium-text",
  4: "bg-risk-high-fill text-risk-high-text",
  5: "bg-risk-high-fill text-risk-high-text",
};

export function RiskScore({ score }: { score: number }) {
  const { t } = useTranslation();
  const level = Math.min(Math.max(score, 1), 5);
  const colors = LEVEL_COLORS[level];

  return (
    <>
      <div className="flex gap-8 items-center p-4">
        <div className={`rounded-full relative size-24 shrink-0 flex justify-center items-center ${colors}`}>
          <p className="text-h1">{score}<span className="text-body ">/5</span> </p>
          <Info className="absolute top-[0.2rem] -right-[0.2rem] stroke-primary bg-white rounded-full" size={25} />
        </div>
        <div className="text-left">
          <p className="text-h3 pb-2">{t(`riskScore${level}Label`)}</p>
          <p className="text-body text-muted">{t(`riskScore${level}Explanation`)}</p>
          <p className="text-body">{t(`riskScore${level}Recommendation`)}</p>
        </div>
      </div>
      <Separator />
    </>
  );
}
