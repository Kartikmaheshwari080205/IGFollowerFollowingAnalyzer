chrome.runtime.onInstalled.addListener(() => {});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveAnalysisData') {
    chrome.storage.local.set({
      followersData: request.data,
      lastUpdated: Date.now()
    }).then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
  
  if (request.action === 'getAnalysisData') {
    chrome.storage.local.get(['followersData', 'lastUpdated']).then(result => {
      sendResponse(result);
    }).catch(error => {
      console.error('Error getting data:', error);
      sendResponse({ error: error.message });
    });
    return true;
  }
});