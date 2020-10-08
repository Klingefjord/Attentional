import { ID as CLASSIFIER_ID } from './content/classifier'
import { ID as FETCH_NODES_ID } from './content/fetchNodes'

chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
	chrome.tabs.executeScript(details.tabId, { file: CLASSIFIER_ID })
	chrome.tabs.executeScript(details.tabId, { file: FETCH_NODES_ID })
})
