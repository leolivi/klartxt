import { Articles, type DsgvoKey } from "@/utils/types/dsgvo-types";

interface CheckTemplate {
  article: Articles;
  title: string;
  explanation: string;
  recommendation: string;
}

export const CHECKS: Record<DsgvoKey, CheckTemplate> = {
  art7: {
    article: Articles.ART7,
    title: "Einwilligung vor Cookie-Setzung (Art. 7)",
    explanation: "Die DSGVO verlangt, dass nicht notwendige Cookies erst nach aktiver Einwilligung gesetzt werden dürfen.",
    recommendation: "Pruefe ob der Cookie-Banner vor dem Laden von Tracking-Cookies erscheint.",
  },
  art13_14: {
    article: Articles.ART1314,
    title: "Datenschutzerklaerung vorhanden (Art. 13/14)",
    explanation: "Webseitenbetreiber sind verpflichtet, Nutzer ueber die Verarbeitung ihrer Daten zu informieren.",
    recommendation: "Suche nach einem Link zur Datenschutzerklaerung im Footer oder der Navigation.",
  },
  art25: {
    article: Articles.ART25,
    title: "Privacy by Design (Art. 25)",
    explanation: "Technische Massnahmen sollen den Datenschutz gewährleisten. Tracker mit hohem Risiko ohne erkennbaren Consent-Mechanismus verletzen das Prinzip der Datensparsamkeit.",
    recommendation: "Entferne oder ersetze High-Risk Tracker, oder stelle sicher dass Consent korrekt eingeholt wird bevor diese geladen werden.",
  },
};