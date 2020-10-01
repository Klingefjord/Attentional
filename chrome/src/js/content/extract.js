import { BASE_URL } from "../../../utils/env"
import { LABELS, MAX_SEQUENCE_COUNT } from '../constants.js'

(function() {
    let sequences = getSequences()
    filterTextNodes(sequences)
})()

function filterTextNodes(sequences) {
    chrome.storage.sync.get([LABELS], labelObj => {
        let labels = labelObj.labels
        if (!Array.isArray(labels)) alert("You need to add one or more labels first")
        fetch(`${BASE_URL}/classify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({"sequences": sequences, "labels": labels})
        })
        .then(response => response.json())
        .then(responseBody => {
            for (const key in responseBody) {
                document.getElementsByClassName(key)[0].style.display = "none"
            }
        })
    })
}

function getSequences() {
    // This should definitely be done by an ML model eventually. But for the initial prototype, let's roll with some brittle manual logic
    const lengthThreshold = 10
    const containerTags = ["DIV", "BUTTON", "UL", "OL", "NAV", "SECTION"]

    const filter = node => {
        const isContainer = containerTags.some(t => t === node.tagName)
        // This maybe should be recursive.
        const hasContainerChildren = Array.from(node.childNodes).some(cn => containerTags.some(ct => ct === cn.nodeName))
        return isContainer && !hasContainerChildren ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    }
    
    const getTextNodes = element => {
        let node, list=[], walk=document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, filter, false);
        while (node=walk.nextNode()) if (node.textContent.length >= lengthThreshold) list.push(node)
        return list;
    }
    

    let textNodes = Array.from(getTextNodes(document.getRootNode()))
    console.log(textNodes)
    textNodes.sort((a,b) => b.innerText.length - a.innerText.length)
    let dict = {}

    for (let i = 0; i < Math.min(textNodes.length, MAX_SEQUENCE_COUNT); i++) {
        const id = `$attentional_filter_candidate_${i}$`
        textNodes[i].classList.add(id)
        dict[id] = cleanText(textNodes[i].innerText)
    }
    console.log(dict) // todo remove
    return dict
}

function cleanText(text) {
    return text
        .replace(/\s\s+/g, ' ')
        .replace('↵', '')
}