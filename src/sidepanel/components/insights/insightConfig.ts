import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import type { InsightSeverity } from "@/utils/insights";

export const SEVERITY_ICON = {
  fine:       { Icon: CircleCheck, className: "bg-risk-low-fill text-risk-low-text rounded-full" },
  suspicious: { Icon: CircleAlert, className: "bg-risk-medium-fill text-risk-medium-text rounded-full" },
  confirmed:  { Icon: CircleX,    className: "bg-risk-high-fill text-risk-high-text rounded-full" },
} satisfies Record<InsightSeverity, { Icon: React.FC<{ size?: number; className?: string }>; className: string }>;

export const BADGE_VARIANT: Record<InsightSeverity, "secondaryGreen" | "secondaryOrange" | "secondaryRed"> = {
  fine:       "secondaryGreen",
  suspicious: "secondaryOrange",
  confirmed:  "secondaryRed",
};
