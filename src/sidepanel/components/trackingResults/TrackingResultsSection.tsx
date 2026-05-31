import { useState } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { Separator } from "../ui/separator";
import { Card } from "../ui/card";
import { DSGVO_KEYS, type DsgvoResult } from "@/utils/types/dsgvo-types";
import { TrackingType } from "@/utils/types/tracking-type";
import { TrackingResultsDialog } from "./TrackingResultsDialog";
import { useTranslation } from "react-i18next";
import { useTabDataContext } from "../../context/useTabDataContext";

function dsgvoIcons(dsgvoResult: DsgvoResult | null) {
  if (!dsgvoResult) return <span className="text-small text-muted">–</span>;
  return (
    <div className="flex gap-1 pb-1">
      {DSGVO_KEYS.map((key) =>
        dsgvoResult[key].passed
          ? <CircleCheck key={key} size={20} className="bg-risk-low-fill text-risk-low-text rounded-full" />
          : <CircleX key={key} size={20} className="bg-risk-high-fill text-risk-high-text rounded-full" />
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
        <Card className="flex-1 cursor-pointer" onClick={() => openTab(TrackingType.DSGVO)} icon={dsgvoIcons(dsgvoResult)} label={t("TrackingResultsCardDSGVO")} />
        <Card className="flex-1 cursor-pointer" onClick={() => openTab(TrackingType.TRACKER)} count={tracker} label="Tracker" />
        <Card className="flex-1 cursor-pointer" onClick={() => openTab(TrackingType.COOKIE)} count={cookies} label="Cookies" />
      </div>
      <TrackingResultsDialog
        open={open}
        onOpenChange={setOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <Separator />
    </>
  );
}
