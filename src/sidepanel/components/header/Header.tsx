import { RefreshCw } from 'lucide-react';
import { useIsDark } from "../../hooks/useIsDark";
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import { Separator } from '../ui/separator';
import { useTabDataContext } from '../../context/useTabDataContext';
import { handleRefresh } from '@/utils/refresh';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const logoLight = "/assets/logo/Klartxt_logo_lm.svg";
const logoDark = "/assets/logo/Klartxt_logo_dm.svg";

export function Header() {
  const { domain, isPartialData, isLoaded } = useTabDataContext();
  const { t } = useTranslation();
  const isDark = useIsDark();
  const logo = isDark ? logoDark : logoLight;
  const [isRefreshing, setIsRefreshing] = useState(false);

  function onRefresh() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    handleRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  }

  return (
    <>
      <header className="flex gap-4 justify-between items-center p-4">
        <div className="flex flex-col gap-2 items-start justify-start">
          <img src={logo} alt="Klartxt logo" width={65} />
          <p className="text-secondary ">{t('headerCurrentlyOn')} <span className="text-muted">{domain ? ` ${domain}` : " "}</span> </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant={isRefreshing || !isLoaded ? "secondaryGreen" : isPartialData ? "secondaryRed" : "defaultFocus"}
            interactive={false}
          >
            {isRefreshing || !isLoaded ? t('headerScanStatusInProgress') : isPartialData ? t('headerScanStatusPartial') : t('headerScanStatusDone')}
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={"defaultFocus"} onClick={onRefresh}>
                <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='top'>
              {t('headerScanButton')}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
      <Separator/>
    </>
  );
}