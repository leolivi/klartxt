export interface RiskScoreDescription {
  level: number;
  label: string;
  explanation: string;
  recommendation: string;
}

export const RISK_SCORE_DESCRIPTIONS: Record<number, RiskScoreDescription> = {
  1: {
    level: 1,
    label: "Sehr geringes Risiko",
    explanation:
      "Diese Webseite zeigt kaum Datenschutzprobleme. Es wurden wenige oder keine Tracker erkannt, Cookies werden sparsam eingesetzt und die DSGVO-Anforderungen werden eingehalten.",
    recommendation:
      "Keine Massnahmen erforderlich. Du kannst diese Seite mit gutem Gewissen nutzen.",
  },
  2: {
    level: 2,
    label: "Geringes Risiko",
    explanation:
      "Diese Webseite sammelt einige Daten, hält sich aber weitgehend an Datenschutzstandards. Es wurden wenige Tracker oder Cookies erkannt, ohne auffällige DSGVO-Verstösse.",
    recommendation:
      "Die Seite ist grundsätzlich datenschutzfreundlich. Du kannst sie nutzen, solltest aber bei sensiblen Aktivitäten aufmerksam bleiben.",
  },
  3: {
    level: 3,
    label: "Mittleres Risiko",
    explanation:
      "Diese Webseite entspricht einem typischen kommerziellen Angebot mit mehreren Trackern und Drittanbieter-Cookies. Es können kleinere DSGVO-Auffälligkeiten vorliegen.",
    recommendation:
      "Prüfe die Datenschutzerklärung der Seite. Erwäge den Einsatz eines Werbeblockers oder aktiviere strengere Datenschutzeinstellungen in deinem Browser.",
  },
  4: {
    level: 4,
    label: "Hohes Risiko",
    explanation:
      "Diese Webseite setzt umfangreiches Tracking ein und weist potenzielle DSGVO-Verstösse auf. Es wurden mehrere Advertising- oder Session-Tracker sowie problematische Cookie-Praktiken erkannt.",
    recommendation:
      "Sei vorsichtig mit dieser Seite. Nutze einen Werbeblocker, teile keine sensiblen Daten und prüfe, ob die Einwilligung korrekt eingeholt wird.",
  },
  5: {
    level: 5,
    label: "Kritisches Risiko",
    explanation:
      "Diese Webseite zeigt schwerwiegende Datenschutzmängel. Es wurden High-Risk Tracker, klare DSGVO-Verstösse oder Cookies vor der Einwilligung festgestellt.",
    recommendation:
      "Kritisch: Vermeide die Nutzung dieser Seite für persönliche Aktivitäten. Die Seite verstösst möglicherweise gegen geltendes Datenschutzrecht.",
  },
};
