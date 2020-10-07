import {
  BASE_URL
} from "../../../utils/env"
import {
  CACHE_UPDATE_INTERVAL_MILLIS,
  MAX_SEQUENCE_COUNT,
  MAX_TEXT_LENGTH,
  MIN_TEXT_LENGTH,
  OBSCURE_THRESHOLD
} from "../constants.js"
import {
  chunkify,
  isValidStr,
  hashCode,
  cleanText
} from "../utils.js"

import {
  getCachedClassificationResults,
  setCachedClassificationResults,
  getLabels
} from "../chromeStorage"

/**
 * Global var to store cached sequences
 * {
 *   "key1"(string): {
 *     "label1"(string): score(float),
 *     "label2"(string): score(float)
 *   },
 *   "key2": ...
 * }
 */
var cache;
var labels;

(function () {
  setupCache().then(() => {
    if (labels.length === 0) {
      console.log("No labels, not classifying content")
      return
    }
    const bodyNode = document.getElementsByTagName("body")[0]
    updateNodes(getNodesFrom(bodyNode, MAX_SEQUENCE_COUNT), MAX_TEXT_LENGTH)
    registerMutationObserver(bodyNode)
  })
})()

/**
 * Checks the cache for @param nodes and add the appropriate class if they exist, 
 * otherwise calls the @function api with them
 */
function updateNodes(nodes, maxTextLength) {
  let pendingApi = {}
  for (const node of nodes) {
    const key = nodeKey(node)

    if (cache[key]) {
      node.classList.add(key)
      handleClassificationResult(key, cache[key])
    } else {
      node.classList.add(key)
      pendingApi[key] = chunkify(nodeText(node), maxTextLength)
    }
  }

  if (Object.keys(pendingApi).length !== 0) {
    api(pendingApi, responseBody => {
      for (const key in responseBody) {
        const classificationResult = responseBody[key]
        cache[key] = classificationResult
        handleClassificationResult(key, classificationResult)
      }
    })
  }
}

/**
 * Adds a mutation listener to the @param rootNode listening for addChildren events 
 * and calling @function updateNodes for all new added nodes
 */
function registerMutationObserver(rootNode) {
  const config = {
    attributes: false,
    childList: true,
    subtree: true
  }

  const callback = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        if (mutation.addedNodes.length > 0) {
          updateNodes([...mutation.addedNodes].filter(isValidTextNode), MAX_TEXT_LENGTH)
        }
      }
    }
  }

  const observer = new MutationObserver(callback);


  // Start observing the target node for configured mutations
  observer.observe(rootNode, config);
}

/**
 * Calls the /classify api with the @param sequences and labels from chrome storage, 
 * and call the @param handler on response
 */
function api(sequences, handler) {
  return getLabels()
  .then(labels => {
    if (labels.length === 0) throw new Error("Need to add at least one label")
    return labels
  })
  .then(labels => fetch(`${BASE_URL}/classify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        sequences: sequences,
        labels: labels
      })
    }))
    .then(response => response.json())
    .then(responseBody => handler(responseBody))
}

/**
 * Algorithm for finding text nodes from a root with a granularity capped by @param allowedNodeCount
 *    
 * From the body tag, recursively sorts tags on text content length and replaces all tags
 * with their children until @param allowedNodeCount limit is reached
 */
function getNodesFrom(rootNode, allowedNodeCount) {
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

/// Util functions
function setupCache() {
  return getCachedClassificationResults(window.location.host)
  .then(chromeCache => {
    cache = chromeCache
    setInterval(updateCache, CACHE_UPDATE_INTERVAL_MILLIS)
    return getLabels()
  })
  .then(labelsFromStorage => {
    console.log(labelsFromStorage)
    labels = labelsFromStorage.map(label => label.toLowerCase())
    return
  })
}

function updateCache() {
  setCachedClassificationResults(window.location.host, cache)
}

function handleClassificationResult(key, classificationResult) {
  for (const [label, score] of Object.entries(classificationResult)) {
    if (score >= OBSCURE_THRESHOLD && labels.some(label => label === label)) {
      document.getElementsByClassName(key)[0].style.display = "none";
    }
  }
}

function nodeText(node) {
  return cleanText(node.innerText ? node.innerText : node.textContent)
}

function nodeKey(node) {
  return `attn_${hashCode(nodeText(node))}`
}

function isValidTextNode(node) {
  return isValidStr(nodeText(node), MIN_TEXT_LENGTH)
}