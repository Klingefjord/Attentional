const lengthThreshold = 10

function textNodesUnder(el){
    console.log(el)
    var node, list=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_ELEMENT,null,false);
    while(node=walk.nextNode()) {
        if (node.childNodes.length == 1 && node.textContent.length >= lengthThreshold) list.push(node)
    }
    return list;
}

textNodes = textNodesUnder(document.getRootNode())

console.log(textNodes.length)
textNodes.forEach(element => {
    console.log(element.textContent)
});