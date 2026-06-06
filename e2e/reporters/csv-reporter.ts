import type { Reporter, TestCase, TestResult } from "@playwright/test/reporter";
import fs from "fs";
import path from "path";
import type { CollectedResults } from "../helpers/results";

function field(value: string | number | boolean | null): string {
  const s = value === null ? "" : String(value);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

type TestRow = {
  date: string;
  suite: string;
  test: string;
  status: string;
  duration_ms: number;
  error: string;
};

class CsvReporter implements Reporter {
  private readonly testRows: TestRow[] = [];
  private readonly date = new Date().toISOString();

  onTestEnd(test: TestCase, result: TestResult): void {
    this.testRows.push({
      date:        this.date,
      suite:       path.basename(test.location.file, ".spec.ts"),
      test:        test.title,
      status:      result.status,
      duration_ms: result.duration,
      error:       (result.errors[0]?.message ?? "").replace(/\n/g, " "),
    });
  }

  onEnd(): void {
    this.writeTestOutcomes();
    this.writeSiteMeasurements();
  }

  private writeTestOutcomes(): void {
    const header = "date,suite,test,status,duration_ms,error";
    const rows = this.testRows.map(r =>
      [field(r.date), field(r.suite), field(r.test), field(r.status), field(r.duration_ms), field(r.error)].join(",")
    );
    const out = path.join("e2e", "report/test-outcomes.csv");
    fs.writeFileSync(out, [header, ...rows].join("\n") + "\n", "utf8");
    console.log(`\n  CSV → ${out}`);
  }

  private writeSiteMeasurements(): void {
    const dataPath = path.join("e2e", "test-results-data.json");
    if (!fs.existsSync(dataPath)) return;

    const { sites } = JSON.parse(fs.readFileSync(dataPath, "utf8")) as CollectedResults;

    const header = [
      "date", "site", "url", "run",
      "score", "tracker_count", "cookie_count",
      "tracking_cookies", "third_party_cookies",
      "scan_duration_ms", "scan_completed",
      "playwright_requests", "extension_requests",
      "page_errors", "sw_errors",
    ].join(",");

    const rows = sites.flatMap(site =>
      site.runs.map((r, i) =>
        [
          field(this.date),
          field(site.name),
          field(site.url),
          field(i + 1),
          field(r.score),
          field(r.trackerDetails.length),
          field(r.cookieDetails.length),
          field(r.cookieDetails.filter(c => c.userCategory === "tracking").length),
          field(r.cookieDetails.filter(c => c.isThirdParty).length),
          field(r.scanDuration),
          field(r.scanCompleted),
          field(r.playwrightRequests),
          field(r.extensionRequests),
          field(r.pageErrors.length),
          field(r.swErrors.length),
        ].join(",")
      )
    );

    const out = path.join("e2e", "report/site-measurements.csv");
    fs.writeFileSync(out, [header, ...rows].join("\n") + "\n", "utf8");
    console.log(`  CSV → ${out}`);
  }
}

export default CsvReporter;
