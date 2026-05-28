import { CircleCheck, CircleX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import type { DsgvoResult } from "@/utils/types/dsgvo-types";
import { TrackingType } from "./TrackingType";
import { useTranslation } from "react-i18next";

const DSGVO_KEYS = ["art7", "art13_14", "art25"] as const;

function DsgvoTab({ dsgvoResult }: { dsgvoResult: DsgvoResult | null }) {
  const { t } = useTranslation();

  if (!dsgvoResult) return <p className="text-small text-muted py-4">{t("trackingResultsDialogError")}</p>;
  return (
    <div>
      {DSGVO_KEYS.map((key, i) => {
        const check = dsgvoResult[key];
        return (
          <div key={key}>
            <div className="flex gap-3 items-start py-3">
              {check.passed
                ? <CircleCheck size={18} className="shrink-0 mt-0.5 text-risk-low-text bg-risk-low-fill rounded-full" />
                : <CircleX size={18} className="shrink-0 mt-0.5 text-risk-high-text bg-risk-high-fill rounded-full" />
              }
              <div>
                <p className="text-body-bold">{t(check.quickTitle)}</p>
                <p className="text-secondary text mt-1">{t(check.explanation)}</p>
                <p className="text-small text-muted mt-1">{t(check.title)}</p>
              </div>
            </div>
            {i < DSGVO_KEYS.length - 1 && <Separator />}
          </div>
        );
      })}
    </div>
  );
}

interface TrackingResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: TrackingType;
  onTabChange: (tab: TrackingType) => void;
  tracker: number;
  cookies: number;
  dsgvoResult: DsgvoResult | null;
}

export function TrackingResultsDialog({
  open,
  onOpenChange,
  activeTab,
  onTabChange,
  tracker,
  cookies,
  dsgvoResult,
}: TrackingResultsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle className="sr-only">Details</DialogTitle>
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as TrackingType)}>
          <TabsList className="mt-4">
            <TabsTrigger value={TrackingType.DSGVO}>DSGVO</TabsTrigger>
            <TabsTrigger value={TrackingType.TRACKER}>Tracker</TabsTrigger>
            <TabsTrigger value={TrackingType.COOKIE}>Cookies</TabsTrigger>
          </TabsList>
          <TabsContent value={TrackingType.DSGVO}>
            <DsgvoTab dsgvoResult={dsgvoResult} />
          </TabsContent>
          <TabsContent value={TrackingType.TRACKER}>
            <p className="text-h2 py-4">{tracker}</p>
          </TabsContent>
          <TabsContent value={TrackingType.COOKIE}>
            <p className="text-h2 py-4">{cookies}</p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
