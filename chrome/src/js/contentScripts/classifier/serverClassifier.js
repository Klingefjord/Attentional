import regeneratorRuntime from "regenerator-runtime"
import {
  LABEL_UPDATE,
  FETCH_HIDDEN,
  UPDATE_HIDDEN
} from '../../messages'
import {
  extractNodesRecursively
} from "./extractNodes"
import {
  getLabels
} from '../../chromeStorage'
import {
  registerMutationObserver
} from './mutationObserver'
import {
  getClassificationResultForHost
} from './classifierApi'
import {
  render
} from './renderer'

/**
 * Global var, list of ClassificationResult from API
 */
var classificationResults = [];
var classificationResultsOverrides = [];

(function () {
  console.log("Running classifier")
  setupClassificationResults().then(() => {
    const body = bodyNode()
    extractNodesRecursively(body, nodes => {
      nodes.forEach(node => render(node, classificationResults, classificationResultsOverrides))
    }, (ig1, ig2) => false)
    startListeningForDOMChanges(body)
  })
})()

async function setupClassificationResults() {
  return getLabels().then(labels => getClassificationResultForHost(window.location.host, labels).then(results => {
    classificationResults = results
  }))
}

function bodyNode() {
  return document.getElementsByTagName("body")[0]
}

function startListeningForDOMChanges(rootNode) {
  registerMutationObserver(rootNode, false, nodes => {
    let currentNodes = [...document.getElementsByClassName("attn_obscured_content")]
    nodes = nodes.filter(n => !currentNodes.some(cn => (n.contains(cn) || cn.contains(n)) && !n.isSameNode(cn)))
    if (nodes.length > 0) {
      nodes.forEach(node => render(node, classificationResults, classificationResultsOverrides))
    }
  }, null)
}

// show/hide hidden content
function handleFetchHidden(msg, response) {
  const hiddenNodes = [...document.getElementsByClassName("attn_obscured_content")]
  const hiddenContent = hiddenNodes.map(node => {
    return {
      id: node.dataset.attn_id,
      text: node.innerText,
      reason: node.dataset.attn_reason,
      hidden: node.hidden
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
  nodes.forEach(node => node.hidden = msg.hide)
  if (nodes.length > 0) {
    console.log(nodes[0])
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