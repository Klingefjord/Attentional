import { BASE_URL } from "../../../utils/env"
import { LABELS } from '../constants.js'

(function() {
    let sequences = getSequences()
    filterTextNodes(sequences)
})()

function filterTextNodes(sequences) {
    alert("ho!")
    console.log("Inside filter text nodes")
    chrome.storage.local.get(LABELS, labels => {
        if (!Array.isArray(labels)) alert("You need to add one or more labels first")
        console.log("got labels: ", labels)
        fetch(`${BASE_URL}/classify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({"sequences": sequences, "labels": labels})
        }).then(response => {
            console.log("got response: ", response)
            for (const key in response) {
                document.getElementsByClassName(key)[0].style.display = "none"
            }
        })
    })
}

function getSequences() {
    // This should definitely be done by an ML model eventually. But for the initial prototype, let's roll with some brittle manual logic
    const lengthThreshold = 10
    const containerTags = ["DIV", "BUTTON", "UL", "OL", "NAV"]

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
    
    const textNodes = getTextNodes(document.getRootNode())
    let dict = {}

    for (let i = 0; i < textNodes.length; i++) {
        const id = "$attentional_filter_candidate_${i}$"
        textNodes[i].classList.add(`$attentional_filter_candidate_${i}$`)
        dict.id = textNodes[i].innerText
    }
    console.log(dict) // todo remove
    return dict
}