![Klartxt Logo](/public/assets/logo/Klartxt_logo_lm.svg)

# Klartxt Extension

This is the source code for the Klartxt Chrome extension. The extension analyzes website tracking mechanisms (network requests and cookies) in real time, visualizes them in a structured way, and provides actionable privacy recommendations based on technical findings.

## Features

- **Risk Score**: Rates the privacy behaviour of the current site from 1 (very low) to 5 (critical), based on tracker count, cookie behaviour, and privacy indicators
- **Tracker detection**: Intercepts outgoing network requests and matches them against the [DuckDuckGo Tracker Radar](https://github.com/duckduckgo/tracker-radar) (DuckDuckGo, Inc., 2025) database
- **Cookie analysis**: Logs all cookies set during a visit, classifies them (necessary / functional / tracking / unknown), and detects first- vs. third-party origin
- **Privacy checks**: Detects whether cookies were set before a consent interaction, whether a privacy policy is findable, and whether high-risk trackers or fingerprinting signals are present
- **Insights**: Summarises findings in plain language
- **Recommendations**: Provides concrete actions the user can take based on what was found
- **Export**: Exports all scan results (at a point in time) as CSV
- **Multilingual**: UI currently available in English, German, French, and Italian
- **Companion website** ([klartxt.app](https://klartxt.app)): Explains what each check means and why it matters and includes the privacy policy and imprint

## Usage

1. Install the extension from the Chrome Web Store or load it unpacked (see below)
2. Visit any website
3. Open the Klartxt side panel via the extension icon
4. The panel shows:
    - A **risk score** (1–5) with a short explanation
    - Three cards for **Privacy checks**, **Trackers**, and **Cookies**, click any card to see the full list
    - An **Insights** section summarising what was detected
    - A **Recommendations** section with suggested next steps
5. Use the **reload button** in the header to re-run the scan on the current page
6. Use the **download button** in the footer to export results as CSV

> All analysis runs locally in your browser. No data is sent to external servers!

## Architecture

![Software architecture diagram](/public/assets/img/software-architecture-diagram.svg)

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (version 24) installed on your machine.

Automatically switch to the Node version defined in the project:
`nvm use`

### Setup

1. Clone or fork the repository:

    ```
    git clone https://github.com/leolivi/klartxt
    ```

2. Install the dependencies:

    ```
    npm install
    ```

## Development

To start the dev server with hot module replacement:

```sh
npm run dev
```

To test the extension in Chrome with Hot Module Replacement:

1. Run `npm run dev`
2. Open `chrome://extensions/`, enable "Developer mode", and load the `build` directory as an unpacked extension
3. After loading, changes to the source code will hot reload in the extension sidepanel automatically

> **Do not open `http://localhost:5174/` directly in the browser.** This is the CRXJS extension dev server, not a website. Opening it in a browser tab will produce errors because Chrome extension APIs are unavailable there.

## Build

To create a production build of the extension:

```sh
npm run build
```

This will generate the build files in the `build` directory.

### Website Build

The repository also includes an informational website (`klartxt.app`) with explanations of what the extension checks, as well as the privacy policy and imprint. It shares the same components, locales, and design tokens as the extension.

To start the website dev server on `localhost:5173`:

```sh
npm run dev:website
```

To build the website for production:

```sh
npm run build:website
```

This will generate the output in the `website-build` directory.

## Testing

### Unit Tests

Unit tests cover scoring logic, insights, recommendations, DSGVO evaluation, heuristics, cache management, network request detection, and DOM-based content checks.

```sh
npm test
```

### E2E Tests (Playwright)

E2E tests run the built extension in a real Chromium instance and verify behaviour across a list of real websites defined in [`e2e/sites.json`](e2e/sites.json). To add or replace sites, edit that file and all test suites pick them up automatically.

**Prerequisites:** a production build must exist before running E2E tests, and Playwright's Chromium browser must be installed.

```sh
npx playwright install chromium  # one-time: download Playwright's Chromium
npm run build:e2e                # build the extension first
npm run test:e2e                 # run all 27 tests (headful Chromium)
npm run test:e2e:report          # open the HTML report in the browser
```

**Test suites:**

| Suite                   | What it checks                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `basic`                 | Extension loads, side panel opens, scan completes on a real page                   |
| `cold-start`            | Cache state is fully restored from session storage after a service worker restart  |
| `collect`               | _(setup)_ Scans all sites and writes `test-results-data.json` for the suites below |
| `console-errors`        | No unhandled JS exceptions thrown on page or in the extension service worker       |
| `cookie-capture`        | Cookies are detected and classified with correct first/third-party status          |
| `performance`           | Full scan completes within 2 seconds                                               |
| `request-capture`       | Extension captures ≥ 100 % of network requests (local only -> skipped in CI)       |
| `score-reproducibility` | Identical scores are reproduced in ≥ 80 % of repeated runs                         |

Each test attaches a JSON result and for reproducibility tests a sidepanel screenshot to the HTML report. These attachments are the basis for manual false-positive analysis.

> Chrome extensions require headful mode (`headless: false`). For CI, a virtual display (Xvfb) is needed -> see the GitHub Actions workflow in [`.github/workflows/e2e.yml`](.github/workflows/e2e.yml).

## Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top right corner
3. Click "Load unpacked" and select the `build` directory

## CI / CD

Three GitHub Actions workflows are included:

| Workflow                                                             | Trigger                                      | What it does                                                                                                                                                                                                               |
| -------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`e2e.yml`](.github/workflows/e2e.yml)                               | Push / pull request                          | Runs unit tests and E2E tests in CI using Xvfb                                                                                                                                                                             |
| [`chrome-deployment.yml`](.github/workflows/chrome-deployment.yml)   | Manual (`workflow_dispatch`)                 | Bumps the version in `manifest.json` based on conventional commits (`feat` -> minor, everything else -> patch), builds the extension, zips it, and uploads it to the Chrome Web Store                                      |
| [`sync-tracking-data.yml`](.github/workflows/sync-tracking-data.yml) | Weekly (Mon 10 AM UTC) / `workflow_dispatch` | Pulls the pre-formatted tracker, CMP, and cookie data files from the [tracking-data-collector](https://github.com/leolivi/tracking-data-collector) repo's `dist/` output and commits them into `src/data/` if they changed |

The tracking data itself is not generated in this repo, it is collected and formatted weekly by the separate [tracking-data-collector](https://github.com/leolivi/tracking-data-collector) pipeline (tracker domains, fingerprinting domains, tracking params, CMP selectors, cookie heuristics), each stored as a flat `{ key: value }` lookup object for O(1) access. `sync-tracking-data.yml` pulls that output into klartxt on its own schedule, an hour after the collector's run, so klartxt controls when new data is accepted.

**Required secrets:**

| Secret                 | Description                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `CHROME_EXTENSION_ID`  | The extension ID from the Chrome Web Store dashboard                                                 |
| `CHROME_CLIENT_ID`     | OAuth client ID from Google Cloud Console                                                            |
| `CHROME_CLIENT_SECRET` | OAuth client secret                                                                                  |
| `CHROME_REFRESH_TOKEN` | Refresh token for the Chrome Web Store API                                                           |
| `ACTIONS_TOKEN`        | GitHub token with read access to `leolivi/tracking-data-collector`, used by `sync-tracking-data.yml` |

## Project Structure

- `public/`: Static assets (fonts, icons, `manifest.json`)
- `src/`: Shared source code
    - `sidepanel/`: Extension UI (React components, context, hooks)
    - `website/`: Informational website (`klartxt.app`) which shares components, locales, and design tokens with the extension
    - `background/`: Extension service worker and background handlers
    - `content/`: Content scripts injected into web pages
    - `locales/`: Shared i18n translation files (EN, DE, FR, IT)
    - `utils/`: Shared utilities and TypeScript types
- `build/`: Production build of the extension (auto-generated)
- `website-build/`: Production build of the website (auto-generated)
- `vite.config.ts`: Vite config for the extension
- `vite.website.config.ts`: Vite config for the website
- `tsconfig.json`: Root TypeScript configuration
- `package.json`: Project dependencies and scripts

## Python Scripts

### Tracker category extraction

The helper script `scripts/tracker-categories-extraction.py` can be run directly from the command line. It does not require the Chrome extension to be installed or started; it only reads the local tracker data from `src/data/trackers/tracker-core.json` and `src/data/trackers/tracker-extended.json`.

If `matplotlib` is not installed yet, install it first:

```sh
python3 -m pip install matplotlib
```

Then run the script from the repository root:

```sh
python3 scripts/tracker-categories-extraction.py
```

The script prints all detected tracker categories with their counts and opens a bar chart window. Pressing "Play" in an editor such as VS Code or PyCharm usually runs the same Python file, but the command above is the reproducible way to execute it.

## Tools

NotebookLM Video Overview (Gemini), Google LLC: https://notebooklm.google.com/
Erklärvideo Klartxt_Privacy_Explained generiert am 14. Juni 2026.
Verwendeter Prompt: "Create a short, engaging video explanation (2–3 minutes) aimed at everyday internet users with no technical background. Topic: What are web trackers and cookies, and what do the different categories mean? Cover these tracker categories in plain language: Advertising, Tracking & Analytics, Content, Security, Functional. Cover these cookie categories: Tracking, Functional, Necessary. Tone: conversational, neutral, not alarmist. Avoid legal jargon. Use concrete everyday analogies where helpful. Do not mention specific companies or products. Keep it factual, explain what these things are, not whether they are good or bad. End with one sentence summarising why it matters to know the difference."

DeepL Translate, DeepL SE: https://www.deepl.com/de/translator
Übersetzung von Textpassagen

Claude, Version Sonnet 4.6, Anthropic: https://claude.ai
Hilfe bei der Erstellung von Textstruktur, Code, Code Review und Lokalisierungen der Website und Erweiterung

## Sources

Chrome for Developers, 2025. Chrome Extensions Docs. [online] Chrome for Developers. Verfügbar unter: <https://developer.chrome.com/docs/extensions?hl=de> [Zugegriffen 13 November 2025].

Davis, K.R., Peabody, B. und Leach, P., 2024. Universally Unique IDentifiers (UUIDs). [Request for Comments] Internet Engineering Task Force. https://doi.org/10.17487/RFC9562.

DuckDuckGo, Inc., 2025. duckduckgo/tracker-radar. [online] GitHub. Verfügbar unter: <https://github.com/duckduckgo/tracker-radar> [Zugegriffen 13 November 2025].

Englehardt, S. und Narayanan, A., 2016. Online Tracking: A 1-million-site Measurement and Analysis. In: Proceedings of the 2016 ACM SIGSAC Conference on Computer and Communications Security. [online] Vienna Austria: ACM. https://doi.org/10.1145/2976749.2978313.

Europäische Union, 2016. Datenschutz-Grundverordnung: Finaler Text der DSGVO. [online] Verfügbar unter: <https://dsgvo-gesetz.de/> [Zugegriffen 13 November 2025].

Kwakman, J., 2023. Open Cookie Database. [online] GitHub. Verfügbar unter: <https://github.com/jkwakman/Open-Cookie-Database> [Zugegriffen 10 Mai 2026].

Le Pochat, V., Van Goethem, T., Tajalizadehkhoob, S., Korczynski, M. und Joosen, W., 2019. Tranco: A Research-Oriented Top Sites Ranking Hardened Against Manipulation. In: Proceedings 2019 Network and Distributed System Security Symposium. [online] Network and Distributed System Security Symposium. San Diego, CA: Internet Society. https://doi.org/10.14722/ndss.2019.23386.

LinkedIn, 2016. LinkedIn Cookie-Tabelle. [online] LinkedIn. Verfügbar unter: <https://de.linkedin.com/legal/l/cookie-table> [Zugegriffen 8 Mai 2026].

Liviero, L., 2025. leolivi/detecta. Verfügbar unter: <https://github.com/leolivi/detecta> [Zugegriffen 25 Dezember 2025].

Mozilla, 2025. HTTP headers | MDN. [online] MDN Web Docs. Verfügbar unter: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers> [Zugegriffen 18 Juni 2026].

Munir, S., Siby, S., Iqbal, U., Englehardt, S., Shafiq, Z. und Troncoso, C., 2023. CookieGraph: Understanding and Detecting First-Party Tracking Cookies. https://doi.org/10.48550/arXiv.2208.12370.

Nouwens, M. und Nylandsted Klokmose, C., 2025. Consent-O-Matic. [online] Verfügbar unter: <https://consentomatic.au.dk/> [Zugegriffen 30 Dezember 2025].

O’Brien, D., 2025. Playwright MCP Servers Explained: Automation and Testing. [online] DEV Community. Verfügbar unter: <https://dev.to/debs_obrien/playwright-mcp-servers-explained-automation-and-testing-4mo0> [Zugegriffen 19 Juni 2026].

Oh, C., 2025. 5tigerjelly/chrome-extension-react-template. Verfügbar unter: <https://github.com/5tigerjelly/chrome-extension-react-template> [Zugegriffen 13 November 2025].

Papadopoulos, P., Kourtellis, N. und Markatos, E.P., 2020. Cookie Synchronization: Everything You Always Wanted to Know But Were Afraid to Ask. In: The World Wide Web Conference. [online] S.1432–1442. https://doi.org/10.1145/3308558.3313542.

Taylor, M. und Weiss, Y., 2026. User-Agent Client Hints. [online] WICG. Verfügbar unter: <https://wicg.github.io/ua-client-hints/> [Zugegriffen 18 Juni 2026].

TikTok For Business, 2025. About TikTok Click ID. [online] TikTok Business Help Center. Verfügbar unter: <https://ads.tiktok.com/help/article/tiktok-click-id?lang=en> [Zugegriffen 8 Mai 2026].

X Corp., 2026. Conversion tracking for websites. [online] X Business. Verfügbar unter: <https://business.x.com/en/help/campaign-measurement-and-analytics/conversion-tracking-for-websites> [Zugegriffen 8 Mai 2026].
