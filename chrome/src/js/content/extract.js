import {
  BASE_URL
} from "../../../utils/env"
import {
  LABELS,
  MAX_SEQUENCE_COUNT,
  MAX_TEXT_LENGTH,
  MIN_TEXT_LENGTH,
} from "../constants.js"
import {
  chunkString,
  isValidStr,
  cleanText
} from "../utils.js"

(function () {
  const nodes = getNodes(MAX_SEQUENCE_COUNT, MIN_TEXT_LENGTH)
  const dict = mapTextToId(nodes, MAX_TEXT_LENGTH)
  console.log(nodes)
  console.log(dict)

  // Doing this sequentially for now
  for (let [key, value] of Object.entries(dict)) {
    let temp = {}
    temp[key] = value

    api(temp, responseBody => {
      for (const key in responseBody) console.log("Supposed to hide element with key ", temp[key])
      for (const key in responseBody) document.getElementsByClassName(key)[0].style.display = "none";
    })
  }
})()

function mapTextToId(nodes, maxTextLength) {
  let dict = {};

  for (let i = 0; i < nodes.length; i++) {
    const cleanedText = cleanText(nodes[i].innerText ? nodes[i].innerText : nodes[i].textContent) // textNodes has no .innerText attribute, but do have a .textContent attribute
    const tag = `$attentional_filter_candidate_${i}$`

    if (!Object.keys(dict).some(k => dict[k].length === 1 && dict[k][0] === cleanedText)) {
      // Only add to dict if no dupes of the text already exists.
      dict[tag] = chunkString(cleanedText, maxTextLength)
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
 * From the body tag, recursively sorts tags on text content length and replaces all tags
 * with their children until @param allowedNodeCount limit is reached
 */
function getNodes(allowedNodeCount, minTextLength) {
  const INVALID_TAG_NAMES = ["SCRIPT", "NOSCRIPT", "HTML"]

  const getRelevantChildren = node => {
    const validChildren = node.children ? [...(node.children)]
      .filter(c => isValidStr(c.innerText, minTextLength))
      .filter(c => !INVALID_TAG_NAMES.some(tag => tag == c.nodeName)) : []
    return validChildren
  }

  let nodes = getRelevantChildren(document.getElementsByTagName("body")[0])
  let withinAllowedNodeCount = true

  while (withinAllowedNodeCount) {
    // sort nodes in reverse order
    nodes = nodes.sort((a, b) => a.innerText && b.innerText ? b.innerText.length - a.innerText.length : 0)

    // keep track of changes made, in case we are never able to fill up the allowedNodeCount
    let changesMadeThisIteration = false

    // loop through nodes in reverse order
    // as long as we're not past the limit, replace each node with its children
    for (let i = nodes.length - 1; i >= 0; i--) {
      const childReplacements = getRelevantChildren(nodes[i])
      
      if (nodes.length + childReplacements.length - 1 > allowedNodeCount) {
        withinBounds = false
        break
      } else if (childReplacements.length > 0) {
        nodes.splice(i, 1)
        nodes = nodes.concat(childReplacements)
        changesMadeThisIteration = true
      }
    }
    if (!changesMadeThisIteration) break
  }

  return nodes
}