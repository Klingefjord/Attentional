import "../css/popup.css";

const extractTextContent = document.getElementById('extractTextContent');

extractTextContent.onclick = element => 
    chrome.tabs.query({active: true, currentWindow: true}, tabs => 
        chrome.tabs.executeScript(tabs[0].id, { file: "extract.bundle.js" })
    )