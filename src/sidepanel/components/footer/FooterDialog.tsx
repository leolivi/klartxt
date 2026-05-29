import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

const CHECKED_ITEMS = ["tracker", "cookies", "privacyPolicy", "thirdParty"] as const;

export function FooterDialog() {
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm">{t("footerWhatWasChecked")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("footerDialogTitle")}</DialogTitle>
        </DialogHeader>
        <div>
          {CHECKED_ITEMS.map((item, i) => (
            <div key={item}>
              <div className="py-3">
                {/* TODO: convert to links w arrow icon */}
                <p className="text-body underline text-muted">{t(`footerDialog_${item}_title`)}</p>
                <p className="text-body">{t(`footerDialog_${item}_description`)}</p>
              </div>
              {i < CHECKED_ITEMS.length - 1 && <Separator />}
            </div>
          ))}
        </div>
        <DialogDescription className="text-small text-muted border-t pt-3">
          {t("footerDialogDisclaimer")}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
