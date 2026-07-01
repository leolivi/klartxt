import { CHECKED_ITEMS } from "@/utils/types/footer-types"
import { ArrowUpRight, Link2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Separator } from "../ui/separator"

export function FooterDialog() {
  const { t } = useTranslation()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-ink-default" size={"xs"}>
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
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer flex items-center gap-1 text-body underline text-ink-strong"
                >
                  {t(`footerDialog_${key}_title`)} <ArrowUpRight size={16} />
                </a>
                <p className="text-body text-ink-default">
                  {t(`footerDialog_${key}_description`)}
                </p>
              </div>
              {i < CHECKED_ITEMS.length && <Separator />}
            </div>
          ))}
        </div>
        <DialogDescription className="text-small text-ink-default">
          {t("footerDialogDisclaimer")}
        </DialogDescription>
        <div className="flex justify-center gap-1">
          <Link2 size={"16"} className="text-ink-strongest" />
          <a
            href="https://klartxt.app"
            target="_blank"
            rel="noreferrer"
            className="text-ink-strongest hover:underline text-small"
          >
            klartxt.app
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
