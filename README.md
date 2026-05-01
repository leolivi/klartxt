
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

developer.chrome.com, 2025. Chrome Extensions Manifest V3. [online] Chrome for Developers. Verfügbar unter: https://developer.chrome.com/docs/extensions?hl=de [Zugegriffen 13 November 2025].

Duck Duck Go, Inc., 2025. duckduckgo/tracker-radar. Verfügbar unter: https://github.com/duckduckgo/tracker-radar [Zugegriffen 13 November
2025].

Englehardt, S. und Narayanan, A., 2016. Online Tracking: A 1-million-site Measurement 
and Analysis.  In: Proceedings of the 2016 ACM SIGSAC Conference on Computer and Communi-
cations Security. [online] Vienna Austria: ACM. https://doi.org/10.1145/2976749.2978313.

Mozilla, 2025. Browser extensions - Mozilla | MDN. [online] MDN Web Docs.
Verfügbar unter: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/
WebExtensions [Zugegriffen 13 November 2025].

Oh, C., 2025. 5tigerjelly/chrome-extension-react-template. Verfügbar unter:
https://github.com/5tigerjelly/chrome-extension-react-template [Zugegriffen
13 November 2025].

<!-- TODO: add cookie graph and detecta as a source -->
- CookieGraph (Munir et al. 2023): name-based heuristics as fallback
   - Cookie-Name Pattern
   - Cookie-Lifetime



