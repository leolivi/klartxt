import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import type { InsightSeverity } from "@/utils/insights";

export const SEVERITY_ICON = {
  fine:       { Icon: CircleCheck, className: "bg-surface-green text-ink-green rounded-full" },
  suspicious: { Icon: CircleAlert, className: "bg-surface-orange text-ink-orange rounded-full" },
  confirmed:  { Icon: CircleX,    className: "bg-surface-red text-ink-red rounded-full" },
} satisfies Record<InsightSeverity, { Icon: React.FC<{ size?: number; className?: string }>; className: string }>;
