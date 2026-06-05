import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, X } from "lucide-react";
import { useTabDataContext } from "../../context/useTabDataContext";

export function WarningBanner() {
  const { riskScore, isLoaded } = useTabDataContext();
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (!isLoaded || riskScore < 4 || dismissed) return null;

  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-risk-high-fill text-risk-high-text">
      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-h3">{t("warningBannerTitle")}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label={t("warningBannerDismiss")}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
