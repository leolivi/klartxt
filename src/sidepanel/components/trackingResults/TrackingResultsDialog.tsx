import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TrackingType } from "@/utils/types/tracking-type";
import { useTabDataContext } from "../../context/useTabDataContext";
import { DsgvoTab } from "./DsgvoTab";
import { TrackerTab } from "./TrackerTab";
import { CookiesTab } from "./CookiesTab";

interface TrackingResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: TrackingType;
  onTabChange: (tab: TrackingType) => void;
}

export function TrackingResultsDialog({ open, onOpenChange, activeTab, onTabChange }: TrackingResultsDialogProps) {
  const { trackerCount, cookieCount } = useTabDataContext();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle className="sr-only">Details</DialogTitle>
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as TrackingType)}>
          <TabsList className="mt-4">
            <TabsTrigger value={TrackingType.DSGVO}>DSGVO</TabsTrigger>
            <TabsTrigger value={TrackingType.TRACKER}>Tracker ({trackerCount})</TabsTrigger>
            <TabsTrigger value={TrackingType.COOKIE}>Cookies ({cookieCount})</TabsTrigger>
          </TabsList>
          <div className="-mx-6 no-scrollbar max-h-[50vh] overflow-y-auto px-6">
            <TabsContent value={TrackingType.DSGVO}><DsgvoTab /></TabsContent>
            <TabsContent value={TrackingType.TRACKER}><TrackerTab /></TabsContent>
            <TabsContent value={TrackingType.COOKIE}><CookiesTab /></TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
