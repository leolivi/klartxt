import { sendResult } from "../content-script";

/* ---- DOM Observer ---- */
export function observeDomChanges() {
    let timeout: number | undefined;

    const observer = new MutationObserver(() => {
        if (timeout) clearTimeout(timeout);

        timeout = window.setTimeout(() => {
            sendResult();
            timeout = undefined;        
        }, 300);
    });

    const root = document.body ?? document.documentElement;
    if (!root) return;

    observer.observe(root, {
        childList: true,
        subtree: true,
    });

    sendResult();

    // SPA safety
    setTimeout(() => {
    observer.disconnect();
    }, 20000);
}
