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
    <div className="hero-gradient min-h-[200px] sm:min-h-[600px] w-full flex flex-col items-center justify-center p-8">
      <Card
        className={`logo-spin-3d${animateOnLoad ? " logo-spin-3d--animate" : ""} bg-primary shadow-xl dark:bg-text size-20 sm:size-40 border-none flex justify-center items-center`}
        onAnimationEnd={() => setAnimateOnLoad(false)}
      >
        <img src={brandmark} alt="Klartxt Brandmark" className="w-full h-full" />
      </Card>
    </div>
  );
}
