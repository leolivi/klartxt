/// <reference types="chrome" />

/* ---- SIDE PANEL ---- */
chrome.sidePanel
  .setPanelBehavior({openPanelOnActionClick: true})
  .catch((error) => console.error(error));

