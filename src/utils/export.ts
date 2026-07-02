import i18n from "@/i18n";
import type { TabDataContextValue } from "@/sidepanel/context/TabDataContextValue";

function cell(value: string | number | boolean | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str;
}

function row(...values: (string | number | boolean | null | undefined)[]): string {
  return values.map(cell).join(",");
}

export function exportTabDataAsCsv(data: TabDataContextValue): void {
  const lines: string[] = [];

  lines.push("SUMMARY");
  lines.push(row("domain", "exportedAt", "riskScore", "scanDuration", "trackerCount", "cookieCount"));
  lines.push(
    row(data.domain, new Date().toISOString(), data.riskScore, data.scanDuration, data.trackerCount, data.cookieCount),
  );

  lines.push("");
  lines.push("TRACKERS");
  lines.push(
    row("domain", "owner", "userCategory", "detailedCategories", "riskScore", "confidence", "fingerprintingScore"),
  );
  for (const t of data.trackerList) {
    lines.push(
      row(
        t.domain,
        t.owner,
        t.userCategory,
        t.detailedCategories.join(" | "),
        t.riskScore,
        t.confidence,
        t.fingerprintingScore,
      ),
    );
  }

  lines.push("");
  lines.push("COOKIES");
  lines.push(row("name", "domain", "category", "userCategory", "isThirdParty", "httpOnly", "secure"));
  for (const c of data.cookiesList) {
    lines.push(row(c.name, c.domain, c.category, c.userCategory, c.isThirdParty, c.httpOnly, c.secure));
  }

  if (data.dsgvoResult) {
    lines.push("");
    lines.push("DSGVO CHECKS");
    lines.push(row("article", "passed", "severity", "quickTitle", "explanation", "recommendation"));
    for (const check of [data.dsgvoResult.art7, data.dsgvoResult.art13_14, data.dsgvoResult.art25]) {
      lines.push(
        row(
          check.article,
          check.passed,
          check.severity,
          i18n.t(check.quickTitle),
          i18n.t(check.explanation),
          i18n.t(check.recommendation),
        ),
      );
    }
  }

  lines.push("");
  lines.push("INSIGHTS");
  lines.push(row("severity", "text"));
  for (const insight of data.insights) {
    lines.push(row(insight.severity, i18n.t(insight.textKey, insight.vars ?? {})));
  }

  lines.push("");
  lines.push("RECOMMENDATIONS");
  lines.push(row(" ", "text"));
  for (const rec of data.recommendations) {
    lines.push(row(" ", i18n.t(rec.textKey)));
  }

  // signals UTF-8 to Excel, prevents garbled umlauts/special chars
  const BOM = "﻿";
  const csv = BOM + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `klartxt_${data.domain}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
