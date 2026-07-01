import { Articles, SeverityLevel } from "@/utils/types/dsgvo-types"

interface CheckTemplate {
  article: Articles
  title: string
}

interface SeverityTemplate {
  quickTitle: string
  explanation: string
  recommendation: string
}

type CheckTemplates = {
  base: CheckTemplate
  [SeverityLevel.FINE]: SeverityTemplate
  [SeverityLevel.SUSPICIOUS]: SeverityTemplate
  [SeverityLevel.CONFIRMED]: SeverityTemplate
}

export const ART7_TEMPLATES: CheckTemplates = {
  base: {
    article: Articles.ART7,
    title: "dsgvoArt7Title",
  },
  [SeverityLevel.FINE]: {
    quickTitle: "dsgvoArt7FineQuickTitle",
    explanation: "dsgvoArt7FineExplanation",
    recommendation: "dsgvoArt7FineRecommendation",
  },
  [SeverityLevel.SUSPICIOUS]: {
    quickTitle: "dsgvoArt7SuspiciousQuickTitle",
    explanation: "dsgvoArt7SuspiciousExplanation",
    recommendation: "dsgvoArt7SuspiciousRecommendation",
  },
  [SeverityLevel.CONFIRMED]: {
    quickTitle: "dsgvoArt7ConfirmedQuickTitle",
    explanation: "dsgvoArt7ConfirmedExplanation",
    recommendation: "dsgvoArt7ConfirmedRecommendation",
  },
}

export const ART13_14_TEMPLATES: CheckTemplates = {
  base: {
    article: Articles.ART1314,
    title: "dsgvoArt1314Title",
  },
  [SeverityLevel.FINE]: {
    quickTitle: "dsgvoArt1314FineQuickTitle",
    explanation: "dsgvoArt1314FineExplanation",
    recommendation: "dsgvoArt1314FineRecommendation",
  },
  [SeverityLevel.SUSPICIOUS]: {
    quickTitle: "dsgvoArt1314SuspiciousQuickTitle",
    explanation: "dsgvoArt1314SuspiciousExplanation",
    recommendation: "dsgvoArt1314SuspiciousRecommendation",
  },
  [SeverityLevel.CONFIRMED]: {
    quickTitle: "dsgvoArt1314ConfirmedQuickTitle",
    explanation: "dsgvoArt1314ConfirmedExplanation",
    recommendation: "dsgvoArt1314ConfirmedRecommendation",
  },
}

export const ART25_TEMPLATES: CheckTemplates = {
  base: {
    article: Articles.ART25,
    title: "dsgvoArt25Title",
  },
  [SeverityLevel.FINE]: {
    quickTitle: "dsgvoArt25FineQuickTitle",
    explanation: "dsgvoArt25FineExplanation",
    recommendation: "dsgvoArt25FineRecommendation",
  },
  [SeverityLevel.SUSPICIOUS]: {
    quickTitle: "dsgvoArt25SuspiciousQuickTitle",
    explanation: "dsgvoArt25SuspiciousExplanation",
    recommendation: "dsgvoArt25SuspiciousRecommendation",
  },
  [SeverityLevel.CONFIRMED]: {
    quickTitle: "dsgvoArt25ConfirmedQuickTitle",
    explanation: "dsgvoArt25ConfirmedExplanation",
    recommendation: "dsgvoArt25ConfirmedRecommendation",
  },
}
