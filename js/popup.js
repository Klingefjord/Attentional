let extractTextContent = document.getElementById('extractTextContent');


// TODO - will use a similar setup when fetchin user preferences
// chrome.storage.sync.get('color', function(data) {
//   extractTextContent.style.backgroundColor = data.color;
//   extractTextContent.setAttribute('value', data.color);
// });

extractTextContent.onclick = function(element) {
    let color = element.target.value;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        console.log("It a worked!")
      chrome.tabs.executeScript(
          tabs[0].id,
          {file: "./js/contentScript.js"}); // THIS IS A CONTENT SCRIPT
    });
  };