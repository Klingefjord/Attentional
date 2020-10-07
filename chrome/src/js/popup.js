import "../css/popup.css";
import {
    getLabels,
    setLabels
} from './chromeStorage.js'
import {
    FETCH_ACTIVE_ELEMENTS,
    SHOW_ELEMENT
} from "./messages";

(function () {
    const extractTextContent = document.getElementById('txt-content-btn')
    const clearStorage = document.getElementById('clr-content-btn')
    const labelInput = document.getElementById('label-input')
    const labelList = document.getElementById('label-list')
    const form = document.getElementById('label-form')

    const hiddenList = document.getElementById('hidden-list')
    const showHidden = document.getElementById('show-hidden')

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

    showHidden.onclick = event => updateHiddenList()

    const updateHiddenList = () => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: FETCH_ACTIVE_ELEMENTS
            }, response => {
                hiddenList.innerHTML = ""
                for (const hiddenNode of response) {
                    let li = document.createElement("li")
                    li.addEventListener('click', _ => {
                        chrome.tabs.query({
                            active: true,
                            currentWindow: true
                        }, tabs => chrome.tabs.sendMessage(tabs[0].id, {
                            action: SHOW_ELEMENT,
                            key: hiddenNode.key
                        }, response => updateHiddenList()))
                    })
                    li.appendChild(document.createTextNode(hiddenNode.text))
                    hiddenList.appendChild(li)
                }
            })
        })
    }

    getLabels().then(updateLabelList)
})()