import { CLASSIFIER_ID } from '../constants'

chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
	chrome.tabs.executeScript(details.tabId, { file: CLASSIFIER_ID })
})
