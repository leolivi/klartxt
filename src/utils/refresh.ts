// function to handle refresh of page in extension ui
export async function handleRefresh() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) chrome.tabs.reload(tab.id);
}
