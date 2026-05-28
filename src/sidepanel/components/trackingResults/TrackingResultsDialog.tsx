import { CircleCheck, CircleX } from "lucide-react";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import type { DsgvoResult } from "@/utils/types/dsgvo-types";
import type { TrackerInfo } from "@/utils/types/tracking-enums";
import { TrackingType } from "./TrackingType";
import { useTranslation } from "react-i18next";
import type { ClassifiedCookie } from "@/utils/types/cookie-types";

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

function TrackerTab({ trackerList }: { trackerList: TrackerInfo[] }) {
  const { t } = useTranslation();

  if (trackerList.length === 0) return <p className="text-small text-muted py-4">{t("trackingResultsDialogError")}</p>;
  return (
    <>
      {trackerList.map((tracker, i) => (
        <div key={tracker.domain}>
          <div className="flex items-center justify-between py-3">
            <p className="text-body">{tracker.domain}</p>
            {/* TODO: add color difference to categories */}
            <Label>{t(`trackerCategory_${tracker.userCategory}`)}</Label>
          </div>
          {i < trackerList.length - 1 && <Separator />}
        </div>
      ))}
    </>
  );
}

// TODO: maybe sort them from tracking to necessary (worst to best)?
function CookiesTab({ cookiesList }: { cookiesList: ClassifiedCookie[] }) {
  const { t } = useTranslation();

  if (cookiesList.length === 0) return <p className="text-small text-muted py-4">{t("trackingResultsDialogError")}</p>;
  return (
    <>
      {cookiesList.map((cookie, i) => (
        <div key={`${cookie.domain}__${cookie.name}`}>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-body">{cookie.name}:</p>
              <p className="text-small text-muted">{t(cookie.isThirdParty ? "cookieThirdParty" : "cookieFirstParty")} - {cookie.domain}</p>
            </div>
            {/* TODO: add color difference to categories */}
            <Label>{t(`cookiesCategory_${cookie.userCategory}`)}</Label>
          </div>
          {i < cookiesList.length - 1 && <Separator />}
        </div>
      ))}
    </>
  );
}

interface TrackingResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: TrackingType;
  onTabChange: (tab: TrackingType) => void;
  tracker: number;
  trackerList: TrackerInfo[];
  cookies: number;
  cookiesList: ClassifiedCookie[];
  dsgvoResult: DsgvoResult | null;
}

export function TrackingResultsDialog({
  open,
  onOpenChange,
  activeTab,
  onTabChange,
  tracker,
  trackerList,
  cookies,
  cookiesList,
  dsgvoResult,
}: TrackingResultsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle className="sr-only">Details</DialogTitle>
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as TrackingType)}>
          <TabsList className="mt-4">
            <TabsTrigger value={TrackingType.DSGVO}>DSGVO</TabsTrigger>
            <TabsTrigger value={TrackingType.TRACKER}>Tracker ({tracker})</TabsTrigger>
            <TabsTrigger value={TrackingType.COOKIE}>Cookies ({cookies})</TabsTrigger>
          </TabsList>
          <div className="-mx-6 no-scrollbar max-h-[50vh] overflow-y-auto px-6">
            <TabsContent value={TrackingType.DSGVO}>
              <DsgvoTab dsgvoResult={dsgvoResult} />
            </TabsContent>
            <TabsContent value={TrackingType.TRACKER}>
              <TrackerTab trackerList={trackerList} />
            </TabsContent>
            <TabsContent value={TrackingType.COOKIE}>
              <CookiesTab cookiesList={cookiesList} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
