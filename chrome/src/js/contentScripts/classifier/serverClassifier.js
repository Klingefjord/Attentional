import regeneratorRuntime from "regenerator-runtime"
import {
  LABEL_UPDATE,
  FETCH_HIDDEN,
  UPDATE_HIDDEN
} from '../../messages'
import {
  OBSCURE_THRESHOLD
} from "../../constants"
import {
  hashCode
} from "./utils"
import {
  extractNodes
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

/**
 * Global var, list of ClassificationResult from API
 */
var classificationResults = [];
var classificationResultsOverrides = [];

(function () {
  console.log("Running classifier")
  setupClassificationResults().then(() => {
    const body = bodyNode()
    const initialNodes = extractNodes(body)
    render(initialNodes)
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
    if (nodes.length > 0) render(nodes)
  }, null)
}

/**
 * Hides nodes if the average of its classified text nodes surpasses @constant OBSCURE_THRESHOLD
 */
function render(nodes) {
  const textNodesUnder = (el) => {
    var n, a = [],
      walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    while (n = walk.nextNode()) a.push(n);
    return [...a];
  }

  nodes.forEach(node => {
    const matchedClassificationResults = textNodesUnder(node).reduce((acc, textNode) => {
      const sequenceHash = hashCode(textNode.textContent)
      const resultsForSequenceHash = classificationResults.filter(cr => cr.sequence_hash === sequenceHash)
      if (resultsForSequenceHash.length > 0) {
        acc = acc.concat(resultsForSequenceHash)
      }
      return acc
    }, [])

    if (matchedClassificationResults.length === 0) return
    const labels = matchedClassificationResults.reduce((acc, cr) => {
      if (acc[cr.label]) {
        acc[cr.label].push(cr)
      } else {
        acc[cr.label] = [cr]
      }
      return acc
    }, {})

    let oneLabelPassingThreshold = false
    let highestLabelScore = 0
    let highestResult = null

    Object.keys(labels).forEach(label => {
      const labelScore = labels[label].reduce((acc, cr) => cr.score + acc, 0) / labels[label].length
      for (const result of labels[label]) {
        if (highestResult === null || result.score >= highestResult.score) highestResult = result
      }
      if (labelScore >= OBSCURE_THRESHOLD) oneLabelPassingThreshold = true
      if (labelScore >= highestLabelScore) highestLabelScore = labelScore
    })

    const override = classificationResultsOverrides.includes(cr => cr.id === highestResult.id) ?
      classificationResultsOverrides.find(cr => cr.id === highestResult.id).hide :
      null

    const hide = override === null ? oneLabelPassingThreshold : override
    if (hide) {
      node.classList.add("attn_obscured_content")
      node.classList.add(`attn_obs_${highestResult.id}`)
      node.dataset.attn_reason = `${highestResult.label} (${Math.round(highestLabelScore * 100)}% certainty)`
      node.dataset.attn_id = highestResult.id
      node.hidden = true
    } else {
      node.hidden = false
    }
  })
}

// show/hide hidden content
function handleFetchHidden(msg, response) {
  const hiddenNodes = [...document.getElementsByClassName("attn_obscured_content")]
  response({
    hiddenContent: hiddenNodes.map(node => {
      return {
        id: Number(node.dataset.attn_id),
        text: node.textContent,
        reason: node.dataset.attn_reason,
        hidden: node.hidden
      }
    })
  })
}

function handleUpdateHidden(msg, response) {
  classificationResultsOverrides.push({
    id: msg.id,
    hide: msg.hide
  })

  classificationResultsOverrides = removeDuplicateObjects(classificationResultsOverrides, 'id')

  console.log("Should be one element: ", Array.from(document.getElementsByClassName(`attn_obs_${msg.id}`)))

  Array.from(document.getElementsByClassName(`attn_obs_${msg.id}`)).forEach(node => {
    node.hidden = msg.hide
  })
  
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

const removeDuplicateObjects = (arr, key) => arr.filter((v,i,a)=>a.findIndex(t=>(t[key] === v[key]))===i)
