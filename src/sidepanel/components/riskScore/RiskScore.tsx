import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import { RiskScoreDialog } from "./RiskScoreDialog";
import { LEVEL_COLORS } from "./LEVEL_COLORS";

export const LEVELS = [1, 2, 3, 4, 5] as const;

export function RiskScore({ score }: { score: number }) {
  const { t } = useTranslation();
  const level = Math.min(Math.max(score, 1), 5);
  const colors = LEVEL_COLORS[level];

  return (
    <>
      <div className="flex gap-8 items-center p-4">
        <div className={`rounded-full relative size-24 shrink-0 flex justify-center items-center ${colors}`}>
          <p className="text-h1">{score}<span className="text-body">/5</span></p>

          <RiskScoreDialog/>
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
