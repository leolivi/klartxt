
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

## 📦 Build

To create a production build:

```sh
npm run build
```

This will generate the build files in the `build` directory.

## 📂 Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" using the toggle switch in the top right corner.
3. Click "Load unpacked" and select the `build` directory.

Your React app should now be loaded as a Chrome extension!

## 🗂️ Project Structure

- `public/`: Contains static files and the `manifest.json`.
- `src/`: Contains the React app source code.
- `build/`: Automatically generated folder to upload in Chrome.
- `vite.config.ts`: Vite configuration file.
- `tsconfig.json`: TypeScript configuration file.
- `package.json`: Contains the project dependencies and scripts.

// TODO: add data information (DDG Tracker radar)

## Source

Bekos, P., Papadopoulos, P., Markatos, E.P. und Kourtellis, N., 2023. The Hitchhiker’s Guide to Facebook Web Tracking with Invisible Pixels and Click IDs. In: Proceedings of the ACM Web Conference 2023. [online] S.2132–2143. https://doi.org/10.1145/3543507.3583311.

Chrome for Developers, 2025. Chrome Extensions Docs. [online] Chrome for Developers. Verfügbar unter: https://developer.chrome.com/docs/extensions?hl=de [Zugegriffen 13 November 2025].

Davis, K.R., Peabody, B. und Leach, P., 2024. Universally Unique IDentifiers (UUIDs). [Request for Comments] Internet Engineering Task Force. https://doi.org/10.17487/RFC9562.

DuckDuckGo, Inc., 2025. duckduckgo/tracker-radar. Verfügbar unter: https://github.com/duckduckgo/tracker-radar [Zugegriffen 13 November 2025].

Englehardt, S. und Narayanan, A., 2016. Online Tracking: A 1-million-site Measurement and Analysis. In: Proceedings of the 2016 ACM SIGSAC Conference on Computer and Communications Security. [online] Vienna Austria: ACM. https://doi.org/10.1145/2976749.2978313.

Google, 2026a. About session_attributes. [online] Google Ads Help. Verfügbar unter: https://support.google.com/google-ads/answer/16194756?hl=en&sjid=7359715324757461283-EU [Zugegriffen 8 Mai 2026].

Google, 2026b. URL builders: Collect campaign data with custom URLs. [online] Google Analytics Help. Verfügbar unter: https://support.google.com/analytics/answer/10917952?hl=en [Zugegriffen 8 Mai 2026].

LinkedIn, 2016. LinkedIn Cookie-Tabelle. [online] LinkedIn. Verfügbar unter: https://de.linkedin.com/legal/l/cookie-table [Zugegriffen 8 Mai 2026].

Liviero, L., 2025. leolivi/detecta. Verfügbar unter: https://github.com/leolivi/detecta [Zugegriffen 25 Dezember 2025].

Microsoft, 2026. Auto-tagging of Microsoft Click ID. [online] Microsoft Advertising. Verfügbar unter: https://help.ads.microsoft.com/apex/index/3/en/60000?target=_blank&rel=noopner,noreferrer [Zugegriffen 8 Mai 2026].

Mozilla, 2025. Browser extensions - Mozilla | MDN. [online] MDN Web Docs. Verfügbar unter: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions [Zugegriffen 13 November 2025].

Munir, S., Siby, S., Iqbal, U., Englehardt, S., Shafiq, Z. und Troncoso, C., 2023. CookieGraph: Understanding and Detecting First-Party Tracking Cookies. https://doi.org/10.48550/arXiv.2208.12370.

Oh, C., 2025. 5tigerjelly/chrome-extension-react-template. Verfügbar unter: https://github.com/5tigerjelly/chrome-extension-react-template [Zugegriffen 13 November 2025].

Papadopoulos, P., Kourtellis, N. und Markatos, E.P., 2020. Cookie Synchronization: Everything You Always Wanted to Know But Were Afraid to Ask. In: The World Wide Web Conference. [online] S.1432–1442. https://doi.org/10.1145/3308558.3313542.

TikTok For Business, 2025. About TikTok Click ID. [online] TikTok Business Help Center. Verfügbar unter: https://ads.tiktok.com/help/article/tiktok-click-id?lang=en [Zugegriffen 8 Mai 2026].

X Corp., 2026. Conversion tracking for websites. [online] X Business. Verfügbar unter: https://business.x.com/en/help/campaign-measurement-and-analytics/conversion-tracking-for-websites [Zugegriffen 8 Mai 2026].



