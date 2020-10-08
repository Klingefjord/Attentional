import regeneratorRuntime from "regenerator-runtime";
import {
  CACHE_UPDATE_INTERVAL_MILLIS,
  MAX_TEXT_LENGTH,
} from "../../app/constants.js"
import {
  chunkify
} from "../../app/utils.js"

import {
  nodeKey,
  nodeText
} from "./utils"

import {
  getNodesFrom
} from './extractNodes'
import {
  classify
} from './classifier'

import {
  registerMutationObserver
} from './mutationObserver'

import {
  getCachedClassificationResults,
  setCachedClassificationResults,
  getLabels
} from "../../app/chromeStorage"
import {
  LABEL_UPDATE as LABEL_UPDATE
} from "../../app/messages";

/**
 * Global var to store cached sequences
 * {
 *   "key1"(string): {
 *     "classification_results": {
 *        "label1"(string): score(float),
 *        "label2"(string): score(float)
 *      },
 *     "decision": {
 *       "hide": true|false,
 *       "override": true|false
 *     }
 *   },
 *   "key2": ...
 * }
 */
var cache;
/**
 * Global var to store array of labels
 * ["code", "politics", ...]
 */
var labels;

(function () {
  await setupCache()
  if (labels.length === 0) return
  const bodyNode = document.getElementsByTagName("body")[0]
  const initialNodes = getNodesFrom(bodyNode)
  updateNodes(initialNodes).then(render)
  registerMutationObserver(bodyNode, nodes => {
    nodes.forEach(n => n.style.display = 'none')
    updateNodes(nodes).then(render)
  })
})()

/**
 * Checks the cache for @param nodes and add the appropriate class if they exist, 
 * otherwise calls the @function api with them
 * updates the 
 */
async function updateNodes(nodes) {
  const pendingApi = {}
  const results = {}
  for (const node of nodes) {
    const key = nodeKey(node)

    if (cache[key]) {
      node.classList.add(key)
      results[key] = cache[key]
    } else {
      node.classList.add(key)
      pendingApi[key] = chunkify(nodeText(node), MAX_TEXT_LENGTH)
    }
  }

  // classify using api and merge with cached results
  const apiResults = await classify(pendingApi, labels)
  Object.keys(apiResults).map((key, idx) => results[key] = {...apiResults[key]})

  // Store results in cache
  Object.keys(results).map((key, idx) => cache[key] = {...results[key]})

  return results
}

/**
 * Either hides or shows @param entries depending on the hide and override properties in the `entry.decision` object
 */
function render(entries) {
  for (const [key, val] of Object.entries(entries)) {
    const classificationResult = val.classificationResult
    const decision = val.decision
    
    if (!classificationResult || !decision) continue

    const hide = decision.override ? decision.override : decision.hide
    const setDisplayProperty = node => node.style.display = hide ? 'none' : ''
    Array.from(document.getElementsByClassName(key)).forEach(setDisplayProperty)
  }
}

/// Cache
async function setupCache() {
  return getCachedClassificationResults(window.location.host)
    .then(chromeCache => {
      cache = chromeCache
      setInterval(updateCache, CACHE_UPDATE_INTERVAL_MILLIS)
    })
    .then(() => getLabels())
    .then(labelsFromStorage => {
      labels = labelsFromStorage.map(label => label.toLowerCase())
    })
}

function updateCache() {
  return setCachedClassificationResults(window.location.host, cache)
}

/// Event listeners
chrome.extension.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === LABEL_UPDATE) {
    labels = msg.labels.map(label => label.toLowerCase())
    cache = {}
    updateCache()
    sendResponse(true)
  }
})