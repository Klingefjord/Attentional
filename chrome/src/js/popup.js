import "../css/popup.css";
import {
    getLabels,
    setLabels
} from './chromeStorage.js'

(function () {
    const extractTextContent = document.getElementById('txt-content-btn')
    const clearStorage = document.getElementById('clr-content-btn')
    const labelInput = document.getElementById('label-input')
    const labelList = document.getElementById('label-list')
    const form = document.getElementById('label-form')

    const updateLabelList = labels => {
        if (!Array.isArray(labels)) return
        labelList.innerHTML = ""
        labels.forEach(l => {
            let li = document.createElement("li")
            li.addEventListener('click', _ => removeElement(l))
            li.appendChild(document.createTextNode(l))
            labelList.appendChild(li)
        })
    }

    const removeElement = label => getLabels().then(labels => {
        const index = labels.indexOf(label)
        if (index > -1) labels.splice(index, 1)
        setLabels(labels).then(() => updateLabelList(labels))
    })

    form.addEventListener('submit', event => {
        event.preventDefault()
        getLabels().then(labels => {
            labels.push(labelInput.value)
            setLabels(labels).then(() => updateLabelList(labels))
            labelInput.value = ""
        })
    })

    clearStorage.onclick = event => {
        chrome.storage.sync.clear(() => getLabels().then(updateLabelList))
    }

    extractTextContent.onclick = event => {
        chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs =>
            chrome.tabs.executeScript(tabs[0].id, {
                file: 'classifier.bundle.js'
            })
        )
    }

    getLabels().then(updateLabelList)
})()