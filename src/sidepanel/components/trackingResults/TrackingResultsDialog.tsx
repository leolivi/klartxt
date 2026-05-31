import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { type DsgvoResult } from "@/utils/types/dsgvo-types";
import type { TrackerInfo } from "@/utils/types/tracking-enums";
import { TrackingType } from "@/utils/types/tracking-type";
import type { ClassifiedCookie } from "@/utils/types/cookie-types";
import { DsgvoTab } from "./DsgvoTab";
import { CookiesTab } from "./CookiesTab";
import { TrackerTab } from "./TrackerTab";

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
