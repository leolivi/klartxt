import { RefreshCw } from 'lucide-react';
import { useIsDark } from "../../hooks/useIsDark";
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';

const logoLight = "/img/logo/Klartxt_logo_lm.svg";
const logoDark = "/img/logo/Klartxt_logo_dm.svg";

export function Header() {
  const isDark = useIsDark();
  const logo = isDark ? logoDark : logoLight;
  const { t } = useTranslation();

  return (
    <div className="flex gap-4 justify-between items-center">
      <div className="flex flex-col gap-2 items-start">
        <img src={logo} alt="Klartxt logo" width={65} />
        <p>{t('headerCurrentlyOn')}</p> {/*TODO: add current domain logic */}
      </div>
      <div className="flex gap-4">
        <Button variant={"defaultFocus"} interactive={false} >{t('headerScanStatusDone')}</Button> {/*TODO: only display if scan is completed*/}
        <Button variant={"defaultFocus"}><RefreshCw size={12} /></Button> {/*TODO: add refresh functionality */}
      </div>
    </div>
  );
}
