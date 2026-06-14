import { useTranslation } from "react-i18next";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useTabDataContext } from "../../context/useTabDataContext";
import { TrackerCategoryForUser } from "@/utils/types/tracking-enums";

const CATEGORY_ORDER: Record<TrackerCategoryForUser, number> = {
  [TrackerCategoryForUser.TRACKING]:   0,
  [TrackerCategoryForUser.ADS]:        1,
  [TrackerCategoryForUser.CONTENT]:    2,
  [TrackerCategoryForUser.SECURITY]:   3,
  [TrackerCategoryForUser.FUNCTIONAL]: 4,
};

export function TrackerTab() {
  const { trackerList } = useTabDataContext();
  const sorted = [...trackerList].sort(
    (a, b) => (CATEGORY_ORDER[a.userCategory] ?? 3) - (CATEGORY_ORDER[b.userCategory] ?? 3)
  );
  const { t } = useTranslation();

  if (trackerList.length === 0) return <p className="text-small text-muted py-4">{t("trackingResultsDialogError")}</p>;
  return (
    <>
      {sorted.map((tracker, i) => (
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
