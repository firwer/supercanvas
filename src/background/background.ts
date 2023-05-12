// TODO: background script
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isEnabledDeadline: true });
  chrome.storage.local.set({ isEnabledFileSearch: true });
});
