import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-risk-low-fill text-risk-low-text",
  2: "bg-risk-low-fill text-risk-low-text",
  3: "bg-risk-medium-fill text-risk-medium-text",
  4: "bg-risk-high-fill text-risk-high-text",
  5: "bg-risk-high-fill text-risk-high-text",
};

const LEVELS = [1, 2, 3, 4, 5] as const;

function RiskScoreDialogDescription() {
  const { t } = useTranslation();
  return (
    <>
      {LEVELS.map((level, i) => (
        <div key={level}>
          <div className="flex gap-3 items-center py-3">
            <div className={`rounded-full size-10 shrink-0 flex items-center justify-center font-semibold ${LEVEL_COLORS[level]}`}>
              {level}
            </div>
            <div>
              <p className="text-body-bold">{t(`riskScore${level}Label`)}</p>
              <p className="text-small text-muted">{t(`riskScore${level}Explanation`)}</p>
              <p className="text-small">{t(`riskScore${level}Recommendation`)}</p>
            </div>
          </div>
          {i < LEVELS.length - 1 && <Separator />}
        </div>
      ))}
    </>
  );
}

export function RiskScore({ score }: { score: number }) {
  const { t } = useTranslation();
  const level = Math.min(Math.max(score, 1), 5);
  const colors = LEVEL_COLORS[level];

  return (
    <>
      <div className="flex gap-8 items-center p-4">
        <div className={`rounded-full relative size-24 shrink-0 flex justify-center items-center ${colors}`}>
          <p className="text-h1">{score}<span className="text-body">/5</span></p>
          <Dialog>
            <DialogTrigger><Info className="absolute top-[0.2rem] -right-[0.2rem] stroke-primary bg-white rounded-full" size={25} /></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("riskScoreDialogTitle")}</DialogTitle>
                <DialogDescription className="text-small text-text-muted">
                  {t("riskScoreDialogDescription")}
                </DialogDescription>
              </DialogHeader>
              <RiskScoreDialogDescription />
            
            </DialogContent>
          </Dialog>
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
