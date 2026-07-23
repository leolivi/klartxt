import { localizeHref } from "@/utils/website-link";
import { CHECKED_ITEMS } from "@/utils/types/footer-types";
import { ArrowUpRight, Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function FooterDialog() {
  const { t, i18n } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="text-ink-strongest" size={"sm"}>
          {t("footerWhatWasChecked")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("footerDialogTitle")}</DialogTitle>
        </DialogHeader>
        <div>
          {CHECKED_ITEMS.map(({ key, href }, i) => (
            <div key={key}>
              <div className="py-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={localizeHref(href, i18n.language)}
                      target="_blank"
                      rel="noreferrer"
                      className="cursor-pointer flex items-center gap-1 text-body underline text-ink-strong w-fit"
                    >
                      {t(`footerDialog_${key}_title`)} <ArrowUpRight size={16} />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="top">{t("footerDialogLinkOpensNewTab")}</TooltipContent>
                </Tooltip>
                <p className="text-body text-ink-default">{t(`footerDialog_${key}_description`)}</p>
              </div>
              {i < CHECKED_ITEMS.length && <Separator />}
            </div>
          ))}
        </div>
        <DialogDescription className="text-small text-ink-default">{t("footerDialogDisclaimer")}</DialogDescription>
        <div className="flex justify-center gap-1">
          <Link2 size={"16"} className="text-ink-strongest" />
          <a
            href={localizeHref("https://klartxt.app", i18n.language)}
            target="_blank"
            rel="noreferrer"
            className="text-ink-strongest hover:underline text-small"
          >
            klartxt.app
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
