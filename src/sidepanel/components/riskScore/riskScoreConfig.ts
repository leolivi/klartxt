export const LEVELS = [1, 2, 3, 4, 5] as const;

export const LEVEL_COLORS: Record<number, string> = {
  1: "bg-risk-low-fill text-risk-low-text",
  2: "bg-risk-low-fill text-risk-low-text",
  3: "bg-risk-medium-fill text-risk-medium-text",
  4: "bg-risk-high-fill text-risk-high-text",
  5: "bg-risk-high-fill text-risk-high-text",
};
