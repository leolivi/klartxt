import type { Recommendation } from "@/utils/recommendations";
import { Cookie, Info, Scale, Shield } from "lucide-react";

export const TYPE_ICON: Record<Recommendation["type"], React.FC<{ size?: number; className?: string }>> = {
  cookie: Cookie,
  tracker: Shield,
  general: Info,
  legal: Scale,
};
