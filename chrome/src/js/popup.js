import "../css/popup.css";
import { LABELS } from './constants.js'

let extractTextContent = document.getElementById('txt-content-btn');
let labelInput = document.getElementById('label-input');
let labelList = document.getElementById('label-list');
let form = document.getElementById('label-form');

let updateLabelList = labels => {
    if (!Array.isArray(labels)) return
    labels.forEach(l => {
        let li = document.createElement("li")
        li.appendChild(document.createTextNode(l))
        labelList.appendChild(li)
    })
}

form.addEventListener('submit', event => {
    event.preventDefault()
    chrome.storage.local.get(LABELS, labels => {
        let list = []
        if (Array.isArray(labels) && labels.length >= 1) list.concat(labels)
        list.push(labelInput.value)
        console.log(list)
        chrome.storage.local.set({LABELS: list}, () => updateLabelList(list))
        labelInput.value = ""
    })
})

extractTextContent.onclick = event => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => 
        chrome.tabs.executeScript(tabs[0].id, { file: 'extract.bundle.js' })
    )
}

chrome.storage.local.get(LABELS, updateLabelList)