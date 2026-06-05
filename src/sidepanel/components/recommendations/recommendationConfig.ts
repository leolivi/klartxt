import { Cookie, Info, Scale, Shield } from "lucide-react";
import type { Recommendation } from "@/utils/recommendations";

export const TYPE_ICON: Record<Recommendation["type"], React.FC<{ size?: number; className?: string }>> = {
  cookie:  Cookie,
  tracker: Shield,
  general: Info,
  legal:   Scale,
};
