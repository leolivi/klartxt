// DSGVO Category 

export enum Articles {
    ART7 = "Art. 7",
    ART1314 = "Art. 13 and Art. 14",
    ART25 = "Art. 25",
}

export type DsgvoKey = "art7" | "art13_14" | "art25";

export interface DsgvoCheck {
  passed: boolean;
  article: Articles;
  title: string;
  explanation: string;
  recommendation: string;
}

export type Art7ContentResult = {
  bannerVisible: boolean;
};

export type DsgvoResult = Record<DsgvoKey, DsgvoCheck> & {
  checkedAt: number;
  highRiskTrackerCount: number;
};

export interface ContentScriptDsgvoResult {
  art7: {
    bannerVisible: boolean;
    cookieCount: number;
  };
  art13_14: boolean;
  art25: boolean;
}