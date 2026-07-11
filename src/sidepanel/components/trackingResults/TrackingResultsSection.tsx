import { DSGVO_KEYS, type DsgvoResult } from "@/utils/types/dsgvo-types";
import { TrackingType } from "@/utils/types/tracking-type";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTabDataContext } from "../../context/useTabDataContext";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { TrackingResultsDialog } from "./TrackingResultsDialog";

function dsgvoScore(dsgvoResult: DsgvoResult | null) {
  if (!dsgvoResult) return "–";
  const passed = DSGVO_KEYS.filter(key => dsgvoResult[key].passed).length;
  return (
    <>
      {passed}
      <span className="text-ink-default text-h3"> / {DSGVO_KEYS.length}</span>
    </>
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
          count={dsgvoScore(dsgvoResult)}
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
