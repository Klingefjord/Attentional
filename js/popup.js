let extractTextContent = document.getElementById('extractTextContent');


// TODO - will use a similar setup when fetchin user preferences
// chrome.storage.sync.get('color', function(data) {
//   extractTextContent.style.backgroundColor = data.color;
//   extractTextContent.setAttribute('value', data.color);
// });

extractTextContent.onclick = (element) => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.executeScript(
            tabs[0].id,
            { 
                file: "./js/extractText.js" 
            }
        );
    });
  };