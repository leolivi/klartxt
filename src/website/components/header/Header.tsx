import LanguageSwitcher from "@/sidepanel/components/languageSwitcher/LanguageSwitcher";

export function Header() {

  return (
       <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/img/logo/Klartxt_logo_lm.svg" alt="klartxt" className="h-7" />
          <span className="text-small text-muted">Privacy explained</span>
        </div>
        <LanguageSwitcher />
      </header>
  );
}
