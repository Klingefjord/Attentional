import {
  BASE_URL
} from "../../../utils/env";
import {
  LABELS,
  MAX_SEQUENCE_COUNT
} from "../constants.js";

(function () {
  const nodes = findMaximumNumberOfTextNodes();
  api(mapTextToId(nodes)).then(responseBody => {
    for (const key in responseBody) document.getElementsByClassName(key)[0].style.display = "none";
  })
})();

function mapTextToId(nodes) {
  let dict = {};

  for (let i = 0; i < Math.min(nodes.length, MAX_SEQUENCE_COUNT); i++) {
    const cleanedText = cleanText(nodes[i].innerText)
    const tag = `$attentional_filter_candidate_${i}$`
    if (cleanedText.length <= lengthThreshold) {
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

function api(sequences) {
  chrome.storage.sync.get([LABELS], (labelObj) => {
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
      .then((response) => response.json());
  });
}

function findMaximumNumberOfTextNodes() {
  // This should definitely be done by an ML model eventually. But for the initial prototype, let's roll with some brittle manual logic
  const containerTags = [
    "DIV",
    "BUTTON",
    "UL",
    "OL",
    "NAV",
    "SECTION",
    "HEADER",
    "FOOTER",
    "MAIN"
  ];
  const lengthThreshold = 10;

  const isContainer = node => containerTags.some(t => t === node.nodeName);
  const hasInnerText = node => node.innerText && node.innerText.length >= lengthThreshold

  let nodes = [...document.getElementsByTagName("body")]
  let keepIterating = true;

  let bestRun = []
  while (keepIterating) {
    // console.log("In while iteration ", c++, " nodes is ", nodes, ". Amount of nodes with text content is ", nodes.reduce((acc, curr) => {
    //   if (curr.innerText && curr.innerText.length > lengthThreshold) ++acc
    //   return acc
    // }, 0));

    const childNodes = nodes
      .filter(n => n.hasChildNodes)
      .reduce((acc, n) => acc.concat(Array.from(n.childNodes)), [])
      .filter(isContainer)
      .filter(hasInnerText)

    if (childNodes.length < MAX_SEQUENCE_COUNT && childNodes.length != 0) {
      if (childNodes.length >= bestRun.length) bestRun = childNodes
    } else {
      keepIterating = false
    }
  }

  return bestRun
}

function cleanText(text) {
  return text.replace(/\s\s+/g, " ").replace("↵", "").toLowerCase();
}

/**
 * DEPRECATED
 */
function getSequences() {
  // This should definitely be done by an ML model eventually. But for the initial prototype, let's roll with some brittle manual logic
  const lengthThreshold = 10;
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
      if (node.textContent.length >= lengthThreshold) list.push(node);
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