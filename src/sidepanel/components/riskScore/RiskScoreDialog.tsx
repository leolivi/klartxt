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
import { LEVELS, LEVEL_COLORS } from "./riskScoreConfig";

function RiskScoreDialogDescription() {
  const { t } = useTranslation();
  return (
    <>
      {LEVELS.map((level, i) => (
        <div key={level}>
          <div className="flex gap-3 items-center py-3">
            <div className={`rounded-full size-8 shrink-0 flex items-center justify-center font-semibold ${LEVEL_COLORS[level]}`}>
              {level}
            </div>
            <div>
              <p className="text-body-bold text-ink-strong">{t(`riskScore${level}Label`)}</p>
              <p className="text-small text-ink-default">{t(`riskScore${level}Explanation`)}</p>
              <p className="text-small text-ink-strongest">{t(`riskScore${level}Recommendation`)}</p>
            </div>
          </div>
          {i < LEVELS.length && <Separator />}
        </div>
      ))}
    </>
  );
}

export function RiskScoreDialog() {
  const { t } = useTranslation();

  return (
    <>
        <Dialog>
        <DialogTrigger aria-label={t("riskScoreDialogOpenLabel")}><Info aria-hidden="true" className="absolute top-[0.1rem] -right-[0.4rem] stroke-ink-strong bg-surface-primary hover:bg-surface-tertiary rounded-full" size={25} /></DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{t("riskScoreDialogTitle")}</DialogTitle>
            </DialogHeader>
            <RiskScoreDialogDescription />
            <DialogDescription className="text-small text-ink-default">
                {t("riskScoreDialogDescription")}
            </DialogDescription>
        </DialogContent>
        </Dialog>
    </>
  );
}
