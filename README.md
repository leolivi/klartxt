
# Klartxt Extension

This is the source code for the Klartxt Chrome extension. The extension analyzes 
specific tracking mechanisms (network requests and cookies) on a website in real time and visualizes them in a structured way. It checks for compliance with the european data protection regulations, identifies data flows, and provides well-founded recommendations for action based on technical analysis.

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (version 18+ or 20+) installed on your machine.

### Setup

1. Clone or fork the repository :

   ```sh
   # To clone
   git clone https://github.com/leolivi/klartxt
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

## 🚀 Development

To start the dev server with hot module replacement:

```sh
npm run dev
```

This serves the UI at `http://localhost:5173` with live reload. To also test the extension in Chrome with HMR:

1. Run `npm run dev`
2. Open `chrome://extensions/`, enable "Developer mode", and load the `build` directory as an unpacked extension
3. After loading, changes to the source code will hot reload in the extension sidepanel automatically

> **Note:** `localhost:5173` is useful for fast UI iteration. Chrome-specific APIs (tracker data, cookies) are only available when running inside the extension.

## 📦 Build

To create a production build of the extension:

```sh
npm run build
```

This will generate the build files in the `build` directory.

### Website Build

The repository also includes an informational website (`klartxt.com`) with explanations of what the extension checks, as well as the privacy policy and imprint. It shares the same components, locales, and design tokens as the extension.

To start the website dev server:

```sh
npm run dev:website
```

To build the website for production:

```sh
npm run build:website
```

This will generate the output in the `website-build` directory.

## 🧪 Testing

### Unit Tests

Unit tests cover scoring logic, insights, recommendations, DSGVO evaluation, heuristics, cache management, network request detection, and DOM-based content checks.

```sh
npm test          # run once
npm run test:watch  # watch mode
```

### E2E Tests (Playwright)

E2E tests run the built extension in a real Chromium instance and verify behaviour across a list of real websites defined in [`e2e/sites.json`](e2e/sites.json). To add or replace sites, edit that file and all test suites pick them up automatically.

**Prerequisites:** a production build must exist before running E2E tests.

```sh
npm run build            # build the extension first
npm run test:e2e         # run all 27 tests (headful Chromium)
npm run test:e2e:report  # open the HTML report in the browser
```

**Test suites:**

| Suite | What it checks |
|---|---|
| `basic` | Extension loads, side panel opens, scan completes on a real page |
| `cold-start` | Cache state is fully restored from session storage after a service worker restart |
| `collect` | *(setup)* Scans all sites and writes `test-results-data.json` for the suites below |
| `console-errors` | No unhandled JS exceptions thrown on page or in the extension service worker |
| `cookie-capture` | Cookies are detected and classified with correct first/third-party status |
| `performance` | Full scan completes within 2 seconds |
| `request-capture` | Extension captures ≥ 100 % of network requests (local only —> skipped in CI) |
| `score-reproducibility` | Identical scores are reproduced in ≥ 80 % of repeated runs |

Each test attaches a JSON result and for reproducibility tests a sidepanel screenshot to the HTML report. These attachments are the basis for manual false-positive analysis.

> **Note:** Chrome extensions require headful mode (`headless: false`). For CI, a virtual display (Xvfb) is needed — see the GitHub Actions workflow in [`.github/workflows/e2e.yml`](.github/workflows/e2e.yml).

## 📂 Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" using the toggle switch in the top right corner.
3. Click "Load unpacked" and select the `build` directory.

Your React app should now be loaded as a Chrome extension!

## 🗂️ Project Structure

- `public/`: Static assets (fonts, icons, `manifest.json`).
- `src/`: Shared source code.
  - `sidepanel/`: Extension UI (React components, context, hooks).
  - `website/`: Informational website (`klartxt.com`) which shares components, locales, and design tokens with the extension.
  - `background/`: Extension service worker and background handlers.
  - `content/`: Content scripts injected into web pages.
  - `locales/`: Shared i18n translation files (EN, DE, FR).
  - `utils/`: Shared utilities and TypeScript types.
- `build/`: Production build of the extension (auto-generated).
- `website-build/`: Production build of the website (auto-generated).
- `vite.config.ts`: Vite config for the extension.
- `vite.website.config.ts`: Vite config for the website.
- `tsconfig.json`: Root TypeScript configuration.
- `package.json`: Project dependencies and scripts.

<!-- TODO:  
 - add data information (DDG Tracker radar)
-->

## Source
Chrome for Developers, 2025. Chrome Extensions Docs. [online] Chrome for Developers. Verfügbar unter: <https://developer.chrome.com/docs/extensions?hl=de> [Zugegriffen 13 November 2025].

Davis, K.R., Peabody, B. und Leach, P., 2024. Universally Unique IDentifiers (UUIDs). [Request for Comments] Internet Engineering Task Force. https://doi.org/10.17487/RFC9562.

DuckDuckGo, Inc., 2025. duckduckgo/tracker-radar. [online] GitHub. Verfügbar unter: <https://github.com/duckduckgo/tracker-radar> [Zugegriffen 13 November 2025].

Englehardt, S. und Narayanan, A., 2016. Online Tracking: A 1-million-site Measurement and Analysis. In: Proceedings of the 2016 ACM SIGSAC Conference on Computer and Communications Security. [online] Vienna Austria: ACM. https://doi.org/10.1145/2976749.2978313.

Europäische Union, 2016. Datenschutz-Grundverordnung: Finaler Text der DSGVO. [online] Verfügbar unter: <https://dsgvo-gesetz.de/> [Zugegriffen 13 November 2025].

Kwakman, J., 2023. Open Cookie Database. [online] GitHub. Verfügbar unter: <https://github.com/jkwakman/Open-Cookie-Database> [Zugegriffen 10 Mai 2026].

LinkedIn, 2016. LinkedIn Cookie-Tabelle. [online] LinkedIn. Verfügbar unter: <https://de.linkedin.com/legal/l/cookie-table> [Zugegriffen 8 Mai 2026].

Liviero, L., 2025. leolivi/detecta. Verfügbar unter: <https://github.com/leolivi/detecta> [Zugegriffen 25 Dezember 2025].

Mozilla, 2025. Browser extensions - Mozilla | MDN. [online] MDN Web Docs. Verfügbar unter: <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions> [Zugegriffen 13 November 2025].

Munir, S., Siby, S., Iqbal, U., Englehardt, S., Shafiq, Z. und Troncoso, C., 2023. CookieGraph: Understanding and Detecting First-Party Tracking Cookies. https://doi.org/10.48550/arXiv.2208.12370.

Nouwens, M. und Nylandsted Klokmose, C., 2025. Consent-O-Matic. [online] Verfügbar unter: <https://consentomatic.au.dk/> [Zugegriffen 30 Dezember 2025].

Oh, C., 2025. 5tigerjelly/chrome-extension-react-template. Verfügbar unter: <https://github.com/5tigerjelly/chrome-extension-react-template> [Zugegriffen 13 November 2025].

Papadopoulos, P., Kourtellis, N. und Markatos, E.P., 2020. Cookie Synchronization: Everything You Always Wanted to Know But Were Afraid to Ask. In: The World Wide Web Conference. [online] S.1432–1442. https://doi.org/10.1145/3308558.3313542.

TikTok For Business, 2025. About TikTok Click ID. [online] TikTok Business Help Center. Verfügbar unter: <https://ads.tiktok.com/help/article/tiktok-click-id?lang=en> [Zugegriffen 8 Mai 2026].

X Corp., 2026. Conversion tracking for websites. [online] X Business. Verfügbar unter: <https://business.x.com/en/help/campaign-measurement-and-analytics/conversion-tracking-for-websites> [Zugegriffen 8 Mai 2026].




