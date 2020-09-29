(function() {
    textNodes = tagText()
    filterTextNodes(textNodes)
})()

function filterTextNodes(textNodes) {
    // PLACEHOLDER for ML model, filter out any string with digits
    for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i]
        if (/[0-9]/.test(node.textContent)) node.style.display = "none"
    }
}

function tagText() {
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
    
    textNodes = getTextNodes(document.getRootNode())

    for (let i = 0; i < textNodes.length; i++) {
        textNodes[i].classList.add(`$attentional_filter_candidate_${i}$`)
    }

    return textNodes
}