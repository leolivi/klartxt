import { useTranslation } from 'react-i18next';
import SOURCES from '../../utils/reference.json';

const AI_TOOLS = [
  {
    name: "NotebookLM Video Overview (Gemini)",
    provider: "Google LLC",
    href: "https://notebooklm.google.com/",
    uses: [
      `Erklärvideo Klartxt_Privacy_Explained generiert am 14. Juni 2026.`,
      `Verwendeter Prompt: "Create a short, engaging video explanation (2–3 minutes) aimed at everyday internet users with no technical background. Topic: What are web trackers and cookies, and what do the different categories mean? Cover these tracker categories in plain language: Advertising, Tracking & Analytics, Content, Security, Functional. Cover these cookie categories: Tracking, Functional, Necessary. Tone: conversational, neutral, not alarmist. Avoid legal jargon. Use concrete everyday analogies where helpful. Do not mention specific companies or products. Keep it factual — explain what these things are, not whether they are good or bad. End with one sentence summarising why it matters to know the difference."`,
    ],
  },
  {
    name: "DeepL Translate",
    provider: "DeepL SE",
    href: "https://www.deepl.com/de/translator",
    uses: ["Übersetzung von Textpassagen"],
  },
  {
    name: "Claude, Version Sonnet 4.6",
    provider: "Anthropic",
    href: "https://claude.ai",
    uses: ["Hilfe bei der Erstellung von Textstruktur, Code, Code Review und Lokalisierungen der Website und Erweiterung"],
  },
];

export function SourcesPage() {
  const { t } = useTranslation();

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-h1 mb-4">{t("sourcesPage_title")}</h1>
      <p className="text-body text-muted mb-12">{t("sourcesPage_intro")}</p>

      <section className="mb-12">
        <h2 className="text-h2 mb-6">{t("sourcesPage_tools_heading")}</h2>
        <ul className="flex flex-col gap-4 list-disc list-outside pl-5">
          {AI_TOOLS.map((tool, i) => (
            <li key={i} className="text-body text-muted">
              <span className="font-medium text-foreground">{tool.name}</span>
              {", "}
              {tool.provider}
              {": "}
              <a
                href={tool.href}
                target="_blank"
                rel="noreferrer"
                className="underline text-primary break-all"
              >
                {tool.href}
              </a>
              <div className="mt-1 flex flex-col gap-1">
                {tool.uses.map((use, j) => (
                  <span key={j} className="block">{use}</span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-h2 mb-6">{t("sourcesPage_literature_heading")}</h2>
        <ul className="flex flex-col gap-6 list-disc list-outside pl-5">
          {SOURCES.map((s, i) => (
            <li key={i} className="text-body text-muted">
              {s.citation}
              {s.doi && (
                <>
                  {" "}
                  <a
                    href={s.doi}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-primary break-all"
                  >
                    {s.doi}
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
