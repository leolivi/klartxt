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
import { ArrowUpRight } from "lucide-react";
import { CHECKED_ITEMS } from "@/utils/types/footer-types";

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
          {CHECKED_ITEMS.map(({ key, href }, i) => (
            <div key={key}>
              <div className="py-3">
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer flex items-center gap-1 text-body underline text-primary dark:text-primary-100"
                >
                  {t(`footerDialog_${key}_title`)} <ArrowUpRight size={12} />
                </a>
                <p className="text-body">{t(`footerDialog_${key}_description`)}</p>
              </div>
              {i < CHECKED_ITEMS.length - 1 && <Separator />}
            </div>
          ))}
        </div>
        <DialogDescription className="text-small text-muted">
          {t("footerDialogDisclaimer")}
        </DialogDescription>
        <div className="flex justify-center">
          <a href="https://klartxt.app" target="_blank" rel="noreferrer" className="underline text-primary text-small">klartxt.app</a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
