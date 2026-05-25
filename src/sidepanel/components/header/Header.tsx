import { RefreshCw } from 'lucide-react';
import { useIsDark } from "../../hooks/useIsDark";
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import { Separator } from '../ui/separator';

const logoLight = "/img/logo/Klartxt_logo_lm.svg";
const logoDark = "/img/logo/Klartxt_logo_dm.svg";



export function Header({ domain }: { domain?: string }) {
  const isDark = useIsDark();
  const logo = isDark ? logoDark : logoLight;
  const { t } = useTranslation();

  async function handleRefresh() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) chrome.tabs.reload(tab.id);
  }

  return (
    <>
      <div className="flex gap-4 justify-between items-center p-4">
        <div className="flex flex-col gap-2 items-start">
          <img src={logo} alt="Klartxt logo" width={65} />
          <p className="text-secondary">{t('headerCurrentlyOn')} <span className="text-muted">{domain ? ` ${domain}` : " "}</span> </p>
        </div>
        <div className="flex gap-4">
          <Button variant={"defaultFocus"} interactive={false}>{t('headerScanStatusDone')}</Button> {/*TODO: only display if scan is completed*/}
          <Button variant={"defaultFocus"} onClick={handleRefresh}><RefreshCw size={12} /></Button>
        </div>
      </div>
      <Separator/>
    </>
  );
}
