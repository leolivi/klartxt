import LanguageSwitcher from "@/sidepanel/components/languageSwitcher/LanguageSwitcher";
import { useIsDark } from "@/sidepanel/hooks/useIsDark";

const logoLight = "/assets/logo/Klartxt_logo_lm.svg";
const logoDark = "/assets/logo/Klartxt_logo_dm.svg";

export function Header() {
   const isDark = useIsDark();
    const logo = isDark ? logoDark : logoLight;

  return (
       <header className="px-6 py-4 flex items-center justify-between max-[300px]:flex-col flex-row max-[300px]:gap-3">
        <div className="flex items-center gap-3">
          <a href="/"><img src={logo} alt="klartxt" className="h-7" /></a>
          <span className="text-small text-muted">Privacy explained</span>
        </div>
        <LanguageSwitcher />
      </header>
  );
}
