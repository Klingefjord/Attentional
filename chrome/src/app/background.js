chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
	chrome.tabs.executeScript(details.tabId, { file: 'classifier.bundle.js' })
	chrome.tabs.executeScript(details.tabId, { file: 'fetchNodes.bundle.js' })
})
