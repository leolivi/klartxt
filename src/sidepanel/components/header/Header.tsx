import { RefreshCw } from 'lucide-react';
import { useIsDark } from "../../hooks/useIsDark";
import { Button } from '../button/button';

const logoLight = "/img/logo/Klartxt_logo_lm.svg";
const logoDark = "/img/logo/Klartxt_logo_dm.svg";

export function Header() {
  const isDark = useIsDark();
  const logo = isDark ? logoDark : logoLight;

  return (
    <div className="flex gap-4 justify-between items-center">
      <div className="flex flex-col gap-2 items-start">
        <img src={logo} alt="Klartxt logo" width={65} />
        <p>aktuell auf</p> {/*TODO: add localization and current domain */}
      </div>
      <div className="flex gap-4">
        <Button variant={"defaultFocus"} interactive={false} >Scan abgeschlossen</Button> {/*TODO: remove later */}
        <Button variant={"defaultFocus"}><RefreshCw size={12} /></Button> {/*TODO: remove later */}
      </div>
    </div>
  );
}
