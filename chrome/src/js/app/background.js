import {
	CLASSIFIER_ID,
	FEATURE_REMOVER_ID
} from '../constants'

import {
	REMOVE_SELECTED
} from "../messages";

chrome.webNavigation.onDOMContentLoaded.addListener(function (details) {
	if (/^https:/.test(details.url)) {
		// chrome.tabs.executeScript(details.tabId, {
		// 	file: CLASSIFIER_ID
		// })

		chrome.tabs.executeScript(details.tabId, {
			file: FEATURE_REMOVER_ID
		})
	}
})

chrome.contextMenus.create({
	"id": "feature_remover",
	"title": "Hide this feature",
	"contexts": ["all"]
})

chrome.contextMenus.onClicked.addListener(function (data, tab) {
	if (data.menuItemId === "feature_remover") {
		chrome.tabs.sendMessage(tab.id, {
			action: REMOVE_SELECTED
		}, response => {
			const error = chrome.runtime.lastError;
			if (error) reject(error)
			resolve(response)
		})
	}
})