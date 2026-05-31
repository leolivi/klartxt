import { RefreshCw } from 'lucide-react';
import { useIsDark } from "../../hooks/useIsDark";
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import { Separator } from '../ui/separator';
import { useTabDataContext } from '../../context/useTabDataContext';
import { handleRefresh } from '@/utils/refresh';

const logoLight = "/img/logo/Klartxt_logo_lm.svg";
const logoDark = "/img/logo/Klartxt_logo_dm.svg";

export function Header() {
  const { domain, isPartialData, isLoaded } = useTabDataContext();
  const { t } = useTranslation();
  const isDark = useIsDark();
  const logo = isDark ? logoDark : logoLight;

  return (
    <>
      <div className="flex gap-4 justify-between items-center p-4">
        <div className="flex flex-col gap-2 items-start justify-start">
          <img src={logo} alt="Klartxt logo" width={65} />
          <p className="text-secondary ">{t('headerCurrentlyOn')} <span className="text-muted">{domain ? ` ${domain}` : " "}</span> </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant={!isLoaded ? "secondaryGreen" : isPartialData ? "secondaryRed" : "defaultFocus"}
            interactive={false}
          >
            {!isLoaded ? t('headerScanStatusInProgress') : isPartialData ? t('headerScanStatusPartial') : t('headerScanStatusDone')}
          </Button>
          <Button variant={"defaultFocus"} onClick={handleRefresh}><RefreshCw size={12} /></Button>
        </div>
      </div>
      <Separator/>
    </>
  );
}