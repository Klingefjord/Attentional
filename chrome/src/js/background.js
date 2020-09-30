import '../img/icon-128.png'
import '../img/icon-32.png'


chrome.runtime.onInstalled.addListener(function() {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      		chrome.declarativeContent.onPageChanged.addRules([{
        		conditions: [new chrome.declarativeContent.PageStateMatcher({
          			pageUrl: {schemes: ['https']},
        		})
			],
            			actions: [new chrome.declarativeContent.ShowPageAction()]
      		}]);
    	});
});