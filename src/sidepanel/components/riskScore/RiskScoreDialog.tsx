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
import { LEVELS } from "./RiskScore";
import { LEVEL_COLORS } from "./LEVEL_COLORS";

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
        <DialogTrigger><Info className="absolute top-[0.2rem] -right-[0.2rem] stroke-primary bg-white rounded-full" size={25} /></DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{t("riskScoreDialogTitle")}</DialogTitle>
            </DialogHeader>
            <RiskScoreDialogDescription />
            <DialogDescription className="text-small text-text-muted">
                {t("riskScoreDialogDescription")}
            </DialogDescription>
        </DialogContent>
        </Dialog>
    </>
  );
}
