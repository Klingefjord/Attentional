import {
  BASE_URL
} from "../../../utils/env"
import {
  LABELS,
  SEQUENCES,
  CACHE_UPDATE_INTERVAL_MILLIS,
  MAX_SEQUENCE_COUNT,
  MAX_TEXT_LENGTH,
  MIN_TEXT_LENGTH,
} from "../constants.js"
import {
  chunkString as chunkify,
  isValidStr,
  cleanText,
  unixTimestamp
} from "../utils.js"

// Global var to store the cached sequences
// {
//  "sequence": string,
//  "tag": string
// }
var cache = []

(function () {
  const bodyNode = document.getElementsByTagName("body")[0]
  chrome.storage.sync.get([SEQUENCES], sequences => {
    cache = sequences
    setInterval(updateCache, CACHE_UPDATE_INTERVAL_MILLIS)
    registerMutationObserver(bodyNode)
    updateNodes(getNodesFrom(bodyNode))
  })
})()

// Add a mutation listener to the document. On every addChildren event, check cached values. 
// If none are present for the textContent being added, then proceed to run main algo and store in cache when done. Periodically
// sync with chrome storage every 5 seconds

function hide(className) {
  document.getElementsByClassName(className)[0].style.display = "none";
}

function nodeText(node) {
  return cleanText(node.innerText ? node.innerText : node.textContent)
}

function isValidTextNode(node) {
  return isValidStr(node.innerText, MIN_TEXT_LENGTH)
}

function updateNodes(nodes) {
  let pendingApi = {}
  for (const node of nodes) {
    const key = `attn_${hashCode(nodeText(node))}`

    if (cache[key]) {
      node.classList.add(key)
      hide(key)
    } else {
      node.classList.add(key)

      pendingApi[key] = chunkify(nodeText(node), maxTextLength)
    }
  }

  if (Object.keys(pendingApi).length !== 0) {
    api(pendingApi, responseBody => {
      for (const key in responseBody) hide(key)
    })
  }
}

function registerMutationObserver(rootNode) {
  const config = {
    attributes: false,
    childList: true,
    subtree: true
  }

  const callback = (mutationsList, observer) => {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {



        console.log('A child node has been added or removed.');
        console.log(mutation)
        if (mutation.addedNodes.length > 0) {
          updateNodes(nodes.filter(isValidTextNode))
          mutation.addedNodes.forEach(n => {
            if (n.innerText) console.log(n.innerText)
          })
        }
        //console.log(getNodes(MAX_SEQUENCE_COUNT, MIN_TEXT_LENGTH))
      }
    }
  }

  const observer = new MutationObserver(callback);


  // Start observing the target node for configured mutations
  observer.observe(rootNode, config);
}

function updateCache() {
  chrome.storage.sync.set({
    [SEQUENCES]: cache
  }, () => {})
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
function getNodesFrom(rootNode, allowedNodeCount, minTextLength) {
  const INVALID_TAG_NAMES = ["SCRIPT", "NOSCRIPT", "HTML"]

  const getRelevantChildren = node => {
    const validChildren = node.children ? [...(node.children)]
      .filter(isValidTextNode)
      .filter(c => !INVALID_TAG_NAMES.some(tag => tag == c.nodeName)) : []
    return validChildren
  }

  let nodes = getRelevantChildren(rootNode)
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
        withinAllowedNodeCount = false
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