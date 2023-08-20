// TODO: background script
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isEnabledDeadline: true });
  chrome.storage.local.set({ isEnabledFileSearch: true });
  chrome.storage.local.set({ userMaxDeadlines: 6 });
  chrome.storage.local.set({ userTimeValue: 6 });
  chrome.storage.local.set({ userDate: "weeks" });
});
