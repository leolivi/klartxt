import { exportTabDataAsCsv } from "@/utils/export";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTabDataContext } from "../../context/useTabDataContext";
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { FooterDialog } from "./FooterDialog";

export function Footer() {
  const context = useTabDataContext();
  const { t } = useTranslation();

  return (
    <footer className="flex justify-between items-center gap-8 p-4 fixed left-0 bottom-0 w-full bg-surface-primary">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            size="icon-sm"
            aria-label={t("footerExportCsv")}
            onClick={() => exportTabDataAsCsv(context)}
          >
            <Download aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{t("footerExportCsv")}</TooltipContent>
      </Tooltip>
      <FooterDialog />
      <LanguageSwitcher />
    </footer>
  );
}
