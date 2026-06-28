import { useState } from "react";
import { Card } from "@/sidepanel/components/ui/card";
import { useIsDark } from "@/sidepanel/hooks/useIsDark";

const brandmarkLight = "/assets/logo/Klartxt_brandmark_lm.svg";
const brandmarkDark = "/assets/logo/Klartxt_brandmark_dm.svg";

export function HeroBanner() {
  const isDark = useIsDark();
  const brandmark = isDark ? brandmarkDark : brandmarkLight;
  const [animateOnLoad, setAnimateOnLoad] = useState(true);

  return (
    <div className="hero-gradient sm:min-h-150 min-h-50 w-full flex flex-col items-center justify-center p-8">
      <Card
        className={`logo-spin-3d${animateOnLoad ? " logo-spin-3d--animate" : ""} bg-transparent hover:bg-transparent size-20 sm:size-40 border-none rounded-[7px] overflow-hidden flex justify-center items-center`}
        onAnimationEnd={() => setAnimateOnLoad(false)}
      >
        <img src={brandmark} alt="Klartxt Brandmark" className="w-full h-full" />
      </Card>
    </div>
  );
}
