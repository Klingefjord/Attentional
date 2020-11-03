import {
	getHosts,
	getPendingExtraction,
	setPendingExtraction
} from '../chromeStorage';
import {
	RUNTIME_CLASSIFIER_ID,
	CLASSIFIER_CONTENT_SCRIPT,
	FEATURE_REMOVER_CONTENT_SCRIPT,
	EXTRACTOR_CONTENT_SCRIPT
} from '../constants'

import {
	HOST_UPDATE,
	REMOVE_MODAL,
	REFRESH_HOSTS
} from "../messages";

// import {
// 	restartPoller
// } from './poller'

// restartPoller()
console.log("running background script")

chrome.webNavigation.onDOMContentLoaded.addListener(function (details) {
	if (/^https:/.test(details.url)) {
		const host = new URL(details.url).hostname
		getPendingExtraction(host).then(pendingExtraction =>  {
			if (pendingExtraction) {
				setPendingExtraction(host, false).then(() => {
					chrome.tabs.executeScript(details.tabId, {
						file: EXTRACTOR_CONTENT_SCRIPT
					})
				})
			} else {
					chrome.tabs.executeScript(details.tabId, {
					file: CLASSIFIER_CONTENT_SCRIPT
				})
		
				chrome.tabs.executeScript(details.tabId, {
					file: FEATURE_REMOVER_CONTENT_SCRIPT
				})
			}
		})
	}
})

/* 
	Feature extractor 
*/
chrome.contextMenus.create({
	"id": "feature_remover",
	"title": "Hide this feature",
	"contexts": ["all"]
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

chrome.extension.onMessage.addListener((msg, sender, response) => {
	if (msg.action === REFRESH_HOSTS) {
		getHosts().then(hosts => {
			hosts.forEach(host => {
				setPendingExtraction(host, true).then(() => {
					chrome.tabs.create({
						url: `https://${host}/`,
						active: false
					}, tab => response(true))
				})
			})
		})
	}
})