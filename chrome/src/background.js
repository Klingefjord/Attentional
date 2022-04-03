import {
	SIDEBAR_CONTENT_SCRIPT,
	REMOVE_MODAL
} from './constants'

chrome.contextMenus.create({
	"id": "feature_remover",
	"title": "Hide",
	"contexts": ["all"]
})

chrome.action.onClicked.addListener(function(tab) { 
	chrome.scripting.executeScript({
		target: {
			tabId: tab.id
		},
		files: [
			SIDEBAR_CONTENT_SCRIPT,
		]
	})
})


chrome.contextMenus.onClicked.addListener(function (data, tab) {
	if (data.menuItemId === "feature_remover") {
		chrome.tabs.sendMessage(tab.id, {
			action: REMOVE_MODAL
		}, response => {
			const error = chrome.runtime.lastError;
			if (error) reject(error)
			resolve(response)
		})
	}
})