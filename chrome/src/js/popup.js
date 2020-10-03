import "../css/popup.css";
import { LABELS } from './constants.js'

let extractTextContent = document.getElementById('txt-content-btn');
let labelInput = document.getElementById('label-input');
let labelList = document.getElementById('label-list');
let form = document.getElementById('label-form');

let updateLabelList = labels => {
    if (!Array.isArray(labels)) return
    labelList.innerHTML = ""
    labels.forEach(l => {
        let li = document.createElement("li")
        li.addEventListener('click', _ => removeElement(l))
        li.appendChild(document.createTextNode(l))
        labelList.appendChild(li)
    })
}

let removeElement = label => {
    chrome.storage.sync.get([LABELS], labelObj => {
        if (labelObj.labels) {
            let labels = labelObj.labels
            const index = labels.indexOf(label);
            if (index > -1) labels.splice(index, 1);
            chrome.storage.sync.set({[LABELS]: labels}, () => updateLabelList(labels))
        }
    })
}

form.addEventListener('submit', event => {
    event.preventDefault()
    chrome.storage.sync.get([LABELS], labelObj => {
        let list = []
        if (labelObj.labels && Array.isArray(labelObj.labels)) list = list.concat(labelObj.labels)
        list.push(labelInput.value)
        chrome.storage.sync.set({[LABELS]: list}, () => updateLabelList(list))
        labelInput.value = ""
    })
})

extractTextContent.onclick = event => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => 
        chrome.tabs.executeScript(tabs[0].id, { file: 'extract.bundle.js' })
    )
}

chrome.storage.sync.get([LABELS], labelObj => updateLabelList(labelObj.labels))