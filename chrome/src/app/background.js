import { CLASSIFIER_ID } from './constants'

chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
	console.log(details)
	chrome.tabs.executeScript(details.tabId, { file: CLASSIFIER_ID })
	//chrome.tabs.executeScript(details.tabId, { file: FETCH_NODES_ID })
})
