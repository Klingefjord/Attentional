import {
	CLASSIFIER_ID
} from '../constants'

chrome.webNavigation.onDOMContentLoaded.addListener(function (details) {
	if (/^https:/.test(details.url)) {
		chrome.tabs.executeScript(details.tabId, {
			file: CLASSIFIER_ID
		})
	}
})