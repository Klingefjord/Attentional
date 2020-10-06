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
  const nodes = textNodesSplitOnGranularity(MAX_SEQUENCE_COUNT)
  const dict = mapTextToId(nodes)

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
  let dict = {};

  for (let i = 0; i < nodes.length; i++) {
    const cleanedText = cleanText(nodes[i].innerText ? nodes[i].innerText : nodes[i].textContent) // textNodes has no .innerText attribute, but do have a .textContent attribute
    const tag = `$attentional_filter_candidate_${i}$`

    if (cleanedText.length < MIN_TEXT_LENGTH) {
      continue
    } else if (!Object.keys(dict).some(k => dict[k].length === 1 && dict[k][0] === cleanedText)) {
      // Only add to dict if no dupes of the text already exists.
      dict[tag] = chunkString(cleanedText, MAX_TEXT_LENGTH)
    }

    nodes[i].classList.add(tag);
  }

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

/**
 * Algorithm for finding text nodes
 *    
 * Extract all text nodes in the body
 * Recursively replace the nodes with their parents until reaching limit @param maxAllowedNodeCount
 *  Remove nodes which have reached the html, body or document level
 *  Replace parent p with all the siblings to a node n if parent p contains node n
 *  Remove duplicates
 */
function textNodesSplitOnGranularity(maxAllowedNodeCount) {
  const start = new Date()

  const ignoreableTags = ["SCRIPT", "NOSCRIPT", "HTML", "BODY"]

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
      if (node.parentElement && node.parentElement.children.length === 0 && !ignoreableTags.some(tag => tag === node.parentElement.nodeName)) list.push(node)
    }
    return list;
  };

  let nodes = Array.from(getTextNodes(document.getElementsByTagName("body")[0]));


  let c = 0
  // Recursively replace the nodes with their parents until reaching limit @param maxAllowedNodeCount
  while (nodes.length >= maxAllowedNodeCount) {
    c += 1

    nodes = nodes
      .filter(n => n.parentNode)
      .map(n => n.parentNode)
      .filter(n => !ignoreableTags.some(tag => tag === n.nodeName))

    for (let i = nodes.length - 1; i >= 0; i--) {
      const p = nodes[i]

      // Add up all descendendants of p recursively until one of the children is n if p is an ancestor to n
      // Remove duplicates by turning into Set
      const descendants = [...new Set(nodes.filter(n => p.contains(n) && p !== n).map(decendant => {
        let children = Array.from(p.children)
        while (!children.some(child => child === decendant) && children.length !== 0) {
          children = children.reduce((acc, child) => !child.children ? acc : acc.concat(Array.from(child.children).filter(child => child.innerText)), [])
        }

        return children
      }).flat(Infinity))]

      if (descendants.length > 0) {
        nodes.splice(i, 1)
        nodes = nodes.concat(descendants)
      }
    }

    // Remove duplicates
    nodes = [...new Set(nodes)]
    console.log("Iteration ", c, " node length is ", nodes.length)
  }

  console.log(`Finished parsing. Took ${(new Date() - start) / 1000} s`)
  return nodes
}

function cleanText(str) {
  return str.replace(/\s\s+/g, " ").replace("↵", " ").toLowerCase();
}

// TODO - use this!
function checkValidString(str) {
  return str && /^.*[a-zA-Z]+.*$/.test(str)
}

function chunkString(str, len) {
  const size = Math.ceil(str.length / len)
  const r = Array(size)
  let offset = 0

  for (let i = 0; i < size; i++) {
    r[i] = str.substr(offset, len)
    offset += len
  }

  return r
}