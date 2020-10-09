import regeneratorRuntime from "regenerator-runtime";
import {
  CACHE_UPDATE_INTERVAL_MILLIS,
  MAX_TEXT_LENGTH,
} from "../../constants"

import {
  nodeKey,
  nodeText,
  chunkify
} from "./utils"

import {
  extractNodes
} from './extractNodes'
import {
  classify
} from './classifierApi'

import {
  registerMutationObserver
} from './mutationObserver'

import {
  getCachedClassificationResults,
  setCachedClassificationResults,
  getLabels
} from "../../chromeStorage"
import {
  LABEL_UPDATE,
  FETCH_HIDDEN,
  UPDATE_HIDDEN
} from "../../messages";

/**
 * Global var to store cached sequences
 * {
 *   "key1"(string): {
 *     "classification_results": {
 *        "label1"(string): score(float),
 *        "label2"(string): score(float)
 *      },
 *     "decision": {
 *       "hide": true|false
 *     } (optional)
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
  console.log("Running classifier")
  setupCache().then(() => {
    if (labels.length === 0) return
    const bodyNode = document.getElementsByTagName("body")[0]
    const initialNodes = extractNodes(bodyNode)
    updateNodes(initialNodes).then(render)
    registerMutationObserver(bodyNode, labels, nodes => {
      nodes.forEach(n => n.style.display = 'none')
      updateNodes(nodes).then(render)
    })
  })
})()

/**
 * Checks the cache for @param nodes and add the appropriate class if they exist, 
 * otherwise calls the @function api with them
 * updates the 
 */
async function updateNodes(nodes) {
  const pendingApi = {}
  const existing = {}
  for (const node of nodes) {
    const key = nodeKey(node)

    if (cache[key]) {
      node.classList.add(key)
      existing[key] = cache[key]
    } else {
      node.classList.add(key)
      pendingApi[key] = chunkify(nodeText(node), MAX_TEXT_LENGTH)
    }
  }

  // classify using api and merge with cached results
  return classify(pendingApi, labels).then(apiResults => {
    const results = {
      ...existing,
      ...apiResults
    }

    // Store results in cache
    cache = {
      ...cache,
      ...results
    }

    return results
  })
}

/**
 * Either hides or shows @param entries depending on the hide property in the `entry.decision` object
 */
function render(entries) {
  for (const [key, val] of Object.entries(entries)) {
    const setDisplayProperty = node => node.style.display = val.decision && val.decision.hide ? 'none' : ''
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
function handleLabelUpdate(msg, response) {
  labels = msg.labels.map(label => label.toLowerCase())
  cache = {}
  updateCache()
  response(true)
}

function handleFetchHidden(msg, response) {
  const hidden = []
  Object.keys(cache)
    .map(key => {
      const classifcationResults = cache[key].classificationResults
      const decision = cache[key].decision
      if (classifcationResults && decision) {
        const classifcationResults = cache[key].classificationResults
        const maxLabel = Object.keys(classifcationResults).reduce((a, b) => classificationResults[a] > classificationResults[b] ? a : b)
        hidden.push({
          key: key,
          hide: decision.hide,
          reason: `${maxLabel} (${Math.round(classifcationResults[maxLabel] * 100)}% certainty)`,
          text: [...document.getElementsByClassName(key)].map(nodeText)[0]
        })
      }
    })

  response({
    hidden: hidden
  })
}

function handleSetHidden(msg, response) {
  const key = msg.key
  if (!cache[key]) {
    console.log("Try to set an override for element not in cache")
    sendResponse(false)
    return
  }
  cache[key].decision = {
    ...cache[key].decision,
    hide: msg.hide
  }
  render({[key]: cache[key]})
  response(true)
}

chrome.extension.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === LABEL_UPDATE) {
    handleLabelUpdate(msg, sendResponse)
  } else if (msg.action === FETCH_HIDDEN) {
    handleFetchHidden(msg, sendResponse)
  } else if (msg.action === UPDATE_HIDDEN) {
    handleUpdateHidden(msg, sendResponse)
  }
})