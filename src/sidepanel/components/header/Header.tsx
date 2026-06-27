import { RefreshCw } from 'lucide-react';
import { useIsDark } from "../../hooks/useIsDark";
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import { Separator } from '../ui/separator';
import { useTabDataContext } from '../../context/useTabDataContext';
import { handleRefresh } from '@/utils/refresh';
import { useState } from 'react';

const logoLight = "/assets/logo/Klartxt_logo_lm.svg";
const logoDark = "/assets/logo/Klartxt_logo_dm.svg";

export function Header() {
  const { isPartialData, isLoaded, lastScanned } = useTabDataContext();
  const { t, i18n } = useTranslation();
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
      <header className="flex gap-4 justify-between items-start p-4">
        <img src={logo} alt="Klartxt logo" width={100} />
        <div className="flex flex-col gap-2 items-end justify-start">
          <div className="flex gap-4">
            <Button
              variant={isRefreshing || !isLoaded ? "secondaryGreen" : isPartialData ? "secondaryRed" : "default"}
              interactive={true}
              onClick={onRefresh}
              size={"sm"}
              leadingIcon={<RefreshCw className={isRefreshing ? "animate-spin" : ""} />}
            >
              {isRefreshing || !isLoaded ? t('headerScanStatusInProgress') : isPartialData ? t('headerScanStatusPartial') : (t('headerScanStatusDone'))}
            </Button>
          </div>
          <p className="text-ink-default px-4">{t('headerLastScanned')} <span className="text-ink-default">{lastScanned ? lastScanned.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }) : '–'}</span></p>
        </div>
      </header>
      <Separator/>
    </>
  );
}