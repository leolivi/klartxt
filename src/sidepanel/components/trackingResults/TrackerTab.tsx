import { useTranslation } from "react-i18next";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useTabDataContext } from "../../context/useTabDataContext";

export function TrackerTab() {
  const { trackerList } = useTabDataContext();
  const { t } = useTranslation();

  if (trackerList.length === 0) return <p className="text-small text-muted py-4">{t("trackingResultsDialogError")}</p>;
  return (
    <>
      {trackerList.map((tracker, i) => (
        <div key={tracker.domain}>
          <div className="flex items-center justify-between py-3">
            <p className="text-body">{tracker.domain}</p>
            <Label>{t(`trackerCategory_${tracker.userCategory}`)}</Label>
          </div>
          {i < trackerList.length - 1 && <Separator />}
        </div>
      ))}
    </>
  );
}
