import { DSGVO_KEYS, type DsgvoResult } from "@/utils/types/dsgvo-types";
import { TrackingType } from "@/utils/types/tracking-type";
import { CircleCheck, CircleX } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTabDataContext } from "../../context/useTabDataContext";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { TrackingResultsDialog } from "./TrackingResultsDialog";

function dsgvoIcons(dsgvoResult: DsgvoResult | null, t: (key: string) => string) {
  if (!dsgvoResult) return <span className="text-small text-ink-default">–</span>;
  return (
    <div className="flex gap-1 pb-1">
      {DSGVO_KEYS.map(key =>
        dsgvoResult[key].passed ? (
          <span key={key} className="inline-flex">
            <CircleCheck aria-hidden="true" size={20} className="bg-surface-green text-ink-green rounded-full" />
            <span className="sr-only">{t("dsgvoCheckPassed")}</span>
          </span>
        ) : (
          <span key={key} className="inline-flex">
            <CircleX aria-hidden="true" size={20} className="bg-surface-red text-ink-red rounded-full" />
            <span className="sr-only">{t("dsgvoCheckFailed")}</span>
          </span>
        ),
      )}
    </div>
  );
}

export function TrackingResultsSection() {
  const { trackerCount: tracker, cookieCount: cookies, dsgvoResult } = useTabDataContext();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TrackingType>(TrackingType.DSGVO);

  function openTab(tab: TrackingType) {
    setActiveTab(tab);
    setOpen(true);
  }

  return (
    <>
      <div className="flex gap-4 p-4">
        <Card
          className="flex-1 cursor-pointer"
          onClick={() => openTab(TrackingType.DSGVO)}
          icon={dsgvoIcons(dsgvoResult, t)}
          label={t("TrackingResultsCardDSGVO")}
        />
        <Card
          className="flex-1 cursor-pointer"
          onClick={() => openTab(TrackingType.TRACKER)}
          count={tracker}
          label="Tracker"
        />
        <Card
          className="flex-1 cursor-pointer"
          onClick={() => openTab(TrackingType.COOKIE)}
          count={cookies}
          label="Cookies"
        />
      </div>
      <TrackingResultsDialog open={open} onOpenChange={setOpen} activeTab={activeTab} onTabChange={setActiveTab} />
      <Separator />
    </>
  );
}
