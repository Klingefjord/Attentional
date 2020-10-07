import '../img/icon-128.png'
import '../img/icon-32.png'

chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
	// alert("skepp ohoj")
	// alert(details.tabId)
	chrome.tabs.executeScript(details.tabId, { file: 'classifier.bundle.js' })
	chrome.tabs.executeScript(details.tabId, { file: 'fetchNodes.bundle.js' })
})