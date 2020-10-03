import {
  BASE_URL
} from "../../../utils/env";
import {
  LABELS,
  MAX_SEQUENCE_COUNT,
  MAX_TEXT_LENGTH,
  MIN_TEXT_LENGTH,
} from "../constants.js";

(function () {
  const nodes = findTextParentsEqualToMax()
  console.log(nodes)
  const dict = mapTextToId(nodes)
  console.log(dict)
  // Doing this sequentially to speed up ML process
  for (let [key, value] of Object.entries(dict)) {
    let temp = {}
    temp[key] = value
    api(temp, responseBody => {
      for (const key in responseBody) document.getElementsByClassName(key)[0].style.display = "none";
    })
  }
})()

function mapTextToId(nodes) {
  console.log("inside map text to id")
  let dict = {};

  for (let i = 0; i < Math.min(nodes.length, MAX_SEQUENCE_COUNT); i++) {
    const cleanedText = cleanText(nodes[i].innerText)
    const tag = `$attentional_filter_candidate_${i}$`
    if (cleanedText.length <= MIN_TEXT_LENGTH || cleanedText.length >= MAX_TEXT_LENGTH) {
      continue
    } else if (!Object.keys(dict).some(k => dict[k] === cleanedText)) {
      // Only add to dict if no dupes of the text already exists
      dict[tag] = cleanedText
    }

    nodes[i].classList.add(tag);
  }

  console.log(dict)
  return dict;
}

function api(sequences, handler) {
  return chrome.storage.sync.get([LABELS], (labelObj) => {
    let labels = labelObj.labels;
    if (!Array.isArray(labels))
      alert("You need to add one or more labels first");
    fetch(`${BASE_URL}/classify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          sequences: sequences,
          labels: labels
        }),
      })
      .then((response) => response.json())
      .then(responseBody => handler(responseBody));
  });
}

function findMaximumNumberOfTextNodes() {
  // This should definitely be done by an ML model eventually. But for the initial prototype, let's roll with some brittle manual logic
  const containerTags = [
    "DIV",
    "NAV",
    "SECTION",
    "HEADER",
    "FOOTER",
    "MAIN"
  ];

  const isContainer = node => containerTags.some(t => t === node.nodeName);
  const hasInnerText = node => node.innerText && node.innerText.length >= MIN_TEXT_LENGTH

  let nodes = [...document.getElementsByTagName("body")]
  let keepIterating = true;

  let bestRun = []
  let c = 0
  while (keepIterating) {
    console.log("In while iteration ", c++, " nodes is ", nodes, ". Amount of nodes with text content is ", nodes.reduce((acc, curr) => {
      if (curr.innerText && curr.innerText.length > MIN_TEXT_LENGTH) ++acc
      return acc
    }, 0));

    // get all nodes that have child nodes, get their child nodes and check that they are indeed containers and have text.
    const newNodes = nodes
      .filter(n => n.hasChildNodes)
      .reduce((acc, n) => acc.concat(Array.from(n.childNodes)), [])
      .filter(isContainer)
      .filter(hasInnerText)
      .concat(nodes.filter(n => !n.hasChildNodes))

    if (newNodes.length < MAX_SEQUENCE_COUNT && newNodes.length != 0) {
      if (newNodes.length > bestRun.length) bestRun = newNodes
      nodes = newNodes
    } else {
      keepIterating = false
    }
  }

  return bestRun
}

function findTextParentsEqualToMax() {
  const getTextNodes = element => {
    let node,
      list = [],
      walk = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
    while ((node = walk.nextNode())) {
      if (node.parentElement && node.parentElement.children.length === 0) list.push(node)
    }
    return list;
  };

  let nodes = Array.from(getTextNodes(document.getElementsByTagName("body")[0]));

  let c = 0
  while (nodes.length >= MAX_SEQUENCE_COUNT) {
    c = c++
    nodes = nodes
      .filter(n => n.parentNode)
      .map(n => n.parentNode)
      .filter(n => !["SCRIPT", "NOSCRIPT"].some(ntn => ntn === n.nodeName))
    //console.log(c, ", Nodes after initial filtering: ", nodes)
    nodes = nodes.filter(n1 => !nodes.some(n2 => n1.contains(n2) && n2 !== n1))
    //console.log(c, ", Nodes after second filtering: ", nodes)
    nodes = [...new Set(nodes)]
  }

  return nodes
}

function cleanText(text) {
  return text.replace(/\s\s+/g, " ").replace("↵", "").toLowerCase();
}

/**
 * DEPRECATED
 */
function getSequences() {
  // This should definitely be done by an ML model eventually. But for the initial prototype, let's roll with some brittle manual logic
  const containerTags = ["DIV", "BUTTON", "UL", "OL", "NAV", "SECTION"];

  const filter = (node) => {
    const isContainer = containerTags.some((t) => t === node.tagName);
    // This maybe should be recursive.
    const hasContainerChildren = Array.from(node.childNodes).some((cn) =>
      containerTags.some((ct) => ct === cn.nodeName)
    );
    return isContainer && !hasContainerChildren ?
      NodeFilter.FILTER_ACCEPT :
      NodeFilter.FILTER_SKIP;
  };

  const getTextNodes = (element) => {
    let node,
      list = [],
      walk = document.createTreeWalker(
        element,
        NodeFilter.SHOW_ELEMENT,
        filter,
        false
      );
    while ((node = walk.nextNode()))
      if (node.textContent.length >= MIN_TEXT_LENGTH) list.push(node);
    return list;
  };

  let textNodes = Array.from(getTextNodes(document.getRootNode()));
  textNodes.sort((a, b) => b.innerText.length - a.innerText.length);
  let dict = {};

  for (let i = 0; i < Math.min(textNodes.length, MAX_SEQUENCE_COUNT); i++) {
    const id = `$attentional_filter_candidate_${i}$`;
    textNodes[i].classList.add(id);
    dict[id] = cleanText(textNodes[i].innerText);
  }
  console.log(dict); // todo remove
  return dict;
}