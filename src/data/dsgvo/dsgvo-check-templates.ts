import { Articles, CheckSeverity } from "@/utils/types/dsgvo-types";

interface CheckTemplate {
  article: Articles;
  title: string;
}

interface SeverityTemplate {
  explanation: string;
  recommendation: string;
}

type CheckTemplates = {
  base: CheckTemplate;
  [CheckSeverity.FINE]: SeverityTemplate;
  [CheckSeverity.SUSPICIOUS]: SeverityTemplate;
  [CheckSeverity.CONFIRMED]: SeverityTemplate;
};

export const ART7_TEMPLATES: CheckTemplates = {
  base: {
    article: Articles.ART7,
    title: "Einwilligung vor Cookie-Setzung (Art. 7)",
  },
  [CheckSeverity.FINE]: {
    explanation: "Es wurden keine Cookies vor der Einwilligung gesetzt. Die Webseite scheint die Anforderungen von Art. 7 DSGVO einzuhalten.",
    recommendation: "Keine Massnahmen erforderlich. Die Webseite respektiert die Einwilligung der Nutzer.",
  },
  [CheckSeverity.SUSPICIOUS]: {
    explanation: "Es wurde ein Cookie-Banner erkannt, aber es sind bereits Cookies oder Tracking-Mechanismen aktiv. Dies könnte auf eine vorzeitige Cookie-Setzung hindeuten.",
    recommendation: "Prüfe, ob die erkannten Cookies technisch notwendig sind oder ob sie erst nach Einwilligung gesetzt werden sollten.",
  },
  [CheckSeverity.CONFIRMED]: {
    explanation: "Es wurden definitiv Cookies VOR der Einwilligung gesetzt. Dies ist ein klarer Verstoss gegen Art. 7 DSGVO, der verlangt, dass nicht-notwendige Cookies erst nach aktiver Einwilligung gesetzt werden dürfen.",
    recommendation: "Kritisch: Stelle sicher, dass alle nicht-notwendigen Cookies erst NACH der Einwilligung gesetzt werden. Überprüfe die Implementierung des Cookie-Banners.",
  },
};

export const ART13_14_TEMPLATES: CheckTemplates = {
  base: {
    article: Articles.ART1314,
    title: "Datenschutzerklärung vorhanden (Art. 13/14)",
  },
  [CheckSeverity.FINE]: {
    explanation: "Es wurde ein Link zur Datenschutzerklärung gefunden. Die Webseite erfällt die Informationspflicht nach Art. 13/14 DSGVO.",
    recommendation: "Keine Massnahmen erforderlich. Die Datenschutzerklärung ist zugänglich.",
  },
  [CheckSeverity.SUSPICIOUS]: {
    explanation: "Es wurde ein möglicher Link zur Datenschutzerklärung gefunden, aber die Platzierung oder Beschriftung ist unklar.",
    recommendation: "Prüfe manuell, ob der gefundene Link tatsächlich zur Datenschutzerklärung führt.",
  },
  [CheckSeverity.CONFIRMED]: {
    explanation: "Es wurde kein Link zur Datenschutzerklärung gefunden. Nach Art. 13/14 DSGVO sind Webseitenbetreiber verpflichtet, Nutzer über die Verarbeitung ihrer Daten zu informieren.",
    recommendation: "Kritisch: Füge einen deutlich sichtbaren Link zur Datenschutzerklärung hinzu, idealerweise im Footer oder in der Navigation.",
  },
};

export const ART25_TEMPLATES: CheckTemplates = {
  base: {
    article: Articles.ART25,
    title: "Privacy by Design (Art. 25)",
  },
  [CheckSeverity.FINE]: {
    explanation: "Die Webseite verwendet HTTPS und es wurden keine High-Risk Tracker erkannt. Die technischen Massnahmen entsprechen dem Prinzip 'Privacy by Design'.",
    recommendation: "Keine Massnahmen erforderlich. Die Webseite implementiert angemessene technische Schutzmassnahmen.",
  },
  [CheckSeverity.SUSPICIOUS]: {
    explanation: "Die Webseite verwendet HTTPS, aber es wurden Tracker oder Fingerprinting-Techniken erkannt, die möglicherweise problematisch sein könnten. Browser-Fingerprinting erlaubt die Wiedererkennung von Nutzern ohne Cookies und unterläuft das Prinzip der Datensparsamkeit nach Art. 25 DSGVO.",
    recommendation: "Prüfe die eingesetzten Tracking- und Fingerprinting-Tools und stelle sicher, dass für alle eine Einwilligung eingeholt wird. Überprüfe insbesondere Canvas- und Audio-Fingerprinting-Skripte.",
  },
  [CheckSeverity.CONFIRMED]: {
    explanation: "Es wurden High-Risk Tracker erkannt oder die Verbindung ist nicht verschlüsselt (HTTP statt HTTPS). Dies verstösst gegen das Prinzip der Datensparsamkeit und Privacy by Design nach Art. 25 DSGVO.",
    recommendation: "Kritisch: Entferne High-Risk Tracker, stelle sicher dass die Einwilligung korrekt eingeholt wird, und nutze HTTPS zur Verschlüsselung.",
  },
};