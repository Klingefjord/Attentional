import {
  LABEL_UPDATE,
  FETCH_HIDDEN,
  UPDATE_HIDDEN
} from '../../messages'
import {
  extractArticleNodes,
  extractNodesRecursively
} from "./extractNodes"
import {
  getLabels
} from '../../chromeStorage'
import {
  registerMutationObserver
} from './mutationObserver'
import {
  markSequenceAsSeen as markSequencesAsSeen,
  getClassificationResultForHost
} from './classifierApi'
import {
  render
} from './renderer'

import {
  hashCode, textForClassification
} from '../classifier/utils'

/**
 * Global var, list of ClassificationResult from API
 */
var classificationLabels;
var classificationResults = [];
var classificationResultsOverrides = [];

(function () {
  console.log("Running classifier")
  setupClassificationResults().then(() => {
    const body = bodyNode()
    const nodes = extractArticleNodes(body)
    for (const node of nodes) {
      render(node, classificationResults, classificationResultsOverrides)
    }
    // extractNodesRecursively(body, nodes => {
    //   nodes.forEach(node => render(node, classificationResults, classificationResultsOverrides))
    // }, (ig1, ig2) => false)
    startListeningForDOMChanges(body)
  })
})()

async function setupClassificationResults() {
  return getLabels().then(labels => {
    classificationLabels = labels
    return getClassificationResultForHost(window.location.host, labels)
  }).then(results => {
    classificationResults = results
  })
}

function bodyNode() {
  return document.getElementsByTagName("body")[0]
}

function startListeningForDOMChanges(rootNode) {
  const onNodesAdded = nodes => {
    let currentNodes = [...document.getElementsByClassName("attn_obscured_content")]
    nodes = nodes.filter(n => !currentNodes.some(cn => (n.contains(cn) || cn.contains(n)) && !n.isSameNode(cn)))
    nodes.forEach(node => render(node, classificationResults, classificationResultsOverrides))   
  }

  const onNodesRemoved = nodes => markSequencesAsSeen(window.location.host, classificationLabels, nodes.map(hashCode))

  registerMutationObserver(rootNode, onNodesAdded, null, null, onNodesRemoved)
}

// show/hide hidden content
function handleFetchHidden(msg, response) {
  const hiddenNodes = [...document.getElementsByClassName("attn_obscured_content")]
  const hiddenContent = hiddenNodes.map(node => {
    return {
      id: [...node.classList].filter(c => c.startsWith("attn_obs_"))[0].replace("attn_obs_", ""),
      text: node.textContent,
      reason: node.dataset.attn_reason,
      hidden: node.style.display === 'none'
    }
  })

  response({
    hiddenContent: removeDuplicateObjects(hiddenContent, "id")
  })
}

function handleUpdateHidden(msg, response) {
  classificationResultsOverrides.push({
    id: msg.id,
    hide: msg.hide
  })

  classificationResultsOverrides = removeDuplicateObjects(classificationResultsOverrides, 'id')
  const nodes = Array.from(document.getElementsByClassName(`attn_obs_${msg.id}`))
  if (nodes.length > 0) {
    nodes.forEach(node => node.style.display = msg.hide ? 'none' : '')
    nodes[0].scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    })
  } else {
    alert("That piece of content no longer exists")
  }
  response(true)
}

chrome.extension.onMessage.addListener((msg, sender, response) => {
  if (msg.action === LABEL_UPDATE) {
    setupClassificationResults()
  } else if (msg.action === FETCH_HIDDEN) {
    handleFetchHidden(msg, response)
  } else if (msg.action === UPDATE_HIDDEN) {
    handleUpdateHidden(msg, response)
  }
})

const removeDuplicateObjects = (arr, key) => arr.filter((v, i, a) => a.findIndex(t => (t[key] === v[key])) === i)