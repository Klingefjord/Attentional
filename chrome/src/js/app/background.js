import {
	CLASSIFIER_ID
} from '../constants'
import {
	RELOAD
} from '../messages'

chrome.webNavigation.onDOMContentLoaded.addListener(function (details) {
	if (/^https:/.test(details.url)) {
		chrome.tabs.executeScript(details.tabId, {
			file: CLASSIFIER_ID
		})
	}
})

// chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
// 	if (/^https:/.test(details.url)) {
// 		chrome.tabs.sendMessage(details.tabId, {
// 			action: RELOAD
// 		}, success => {
// 			if (success) {
// 				chrome.tabs.executeScript(details.tabId, {
// 					file: CLASSIFIER_ID
// 				})
// 			}
// 		})
// 	}
// })