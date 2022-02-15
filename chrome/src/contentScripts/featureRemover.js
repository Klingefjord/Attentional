import regeneratorRuntime from "regenerator-runtime";

import {
  REMOVE_SELECTED,
  FETCH_REMOVED,
  UNDO_REMOVED,
  SHOW_REMOVED,
  HIDE_REMOVED,
  REMOVE_MODAL
} from '../messages';

import {
  getRemovedFeatures,
  setRemovedFeatures
} from '../chromeStorage'

import {
  cssPath
} from "./utils";

import {
  SIDEBAR_ID
} from '../constants'

import {
  modal
} from './modal'

var cache;
var selectedElement;
var isHovering = false;

(function () {
  setupCache()
    .then(hideElementsFromCache)
    .then(() => {
      setupEventListener()
      registerMutationObserver(body())
    })
})()

function body() {
  return document.getElementsByTagName("body")[0]
}

async function hideElementsFromCache() {
  for (const selector of cache) {
    const node = document.querySelector(selector)
    if (node) removeElement(node)
  }
}

function removeElement(element) {
  if (!element) return
  element.style.display = 'none'
}

function setupEventListener() {
  document.addEventListener("contextmenu", event => {
    selectedElement = event.target
  }, true);
}

function registerMutationObserver(rootNode) {
  const config = {
    attributes: false,
    childList: true,
    subtree: true
  }

  const observationHandler = (mutationsList, observer) => {
    if (!isHovering) hideElementsFromCache()
  }

  const observer = new MutationObserver(observationHandler);

  // Start observing the target node for configured mutations
  observer.observe(rootNode, config);
}

/// Cache
async function setupCache() {
  return getRemovedFeatures(window.location.host)
    .then(removedFeatures => {
      cache = removedFeatures
    })
}
async function syncCache() {
  return setRemovedFeatures(window.location.host, cache)
}

/// Event listeners
function handleElementRemoval(msg, response) {
  cache = [...cache, cssPath(selectedElement)]
  removeElement(selectedElement)
  selectedElement = null
  syncCache().then(() => response(true))
}

function handleRemoveModal(msg, response) {
  if (!selectedElement) {
    response(false)
    return
  }

  const relevantNodes = [selectedElement]
  const bodyNode = body()

  const addParentRecursively = node => {
    if (node.parentElement 
    && !bodyNode.isSameNode(node.parentElement)
    && relevantNodes.length < 20) {
      relevantNodes.push(node.parentElement)
      addParentRecursively(node.parentElement)
    }
  }

  addParentRecursively(selectedElement)

  const finishCallback = node => {
    removeElement(node)
    cache = [...cache, cssPath(node)]
    syncCache()
  }

  const cancelCallback = () => {
  }

  if (document.getElementById(SIDEBAR_ID)) {
    document.getElementById(SIDEBAR_ID).remove()
  }

  bodyNode.insertBefore(modal(relevantNodes, finishCallback, cancelCallback), bodyNode.firstChild)
}

function handleFetchRemoved(msg, response) {
  const displayInfo = selectorPath => {
    const element = document.querySelector(selectorPath)
    if (!element) return null

    let text = new Set()
    let ariaLabels = new Set()

    let obj = {
      selectorPath: selectorPath
    }

    for (const el of Array.from(element.getElementsByTagName('*'))) {
      if (el.innerText && [...el.children].length === 0) text.add(el.innerText)
      if (el.getAttribute('aria-label')) ariaLabels.add(el.getAttribute('aria-label'))

      if (el.tagName == "IMAGE") {
        obj.type = "Image section"
        break
      } else if (el.tagName == "BUTTON" || el.getAttribute('role') === 'button') {
        obj.type = "Button section"
        break
      }
    }

    const textString = [...text].join(' ∙ ')
    const ariaLabelString = [...ariaLabels].join(' ∙ ')
  
    if (!obj.type) obj.type = textString ? 'Text section' : 'Section'
    if (!obj.content) obj.content = textString ? textString : ariaLabelString ? ariaLabelString : 'No caption'
  
    return obj
  }

  const removedFeatures = cache.map(displayInfo).filter(e => e)
  response(removedFeatures ? removedFeatures : [])
}

function handleUndoRemove(msg, response) {
  const index = cache.indexOf(msg.key)
  const element = document.querySelector(msg.key)

  if (index === -1 || !element) {
    response(false)
  } else {
    cache.splice(index, 1)
    element.style.display = ''
    response(true)

    // Make sure to update cache after updating it
    syncCache()
  }
}

function handleShowRemoved(msg, response) {
  isHovering = true
  const element = document.querySelector(msg.key)
  if (!element) {
    response(false)
  } else {
    element.style.display = ''
    response(true)
  }
}

function handleHideRemoved(msg, response) {
  isHovering = false
  const element = document.querySelector(msg.key)
  if (!element) {
    response(false)
  } else {
    element.style.display = 'none'
    response(true)
  }
}

chrome.extension.onMessage.addListener((msg, sender, response) => {
  if (msg.action === REMOVE_MODAL) {
    handleRemoveModal(msg, response)
  } else if (msg.action === REMOVE_SELECTED) {
    handleElementRemoval(msg, response)
  } else if (msg.action === FETCH_REMOVED) {
    handleFetchRemoved(msg, response)
  } else if (msg.action === UNDO_REMOVED) {
    handleUndoRemove(msg, response)
  } else if (msg.action === SHOW_REMOVED) {
    handleShowRemoved(msg, response)
  } else if (msg.action === HIDE_REMOVED) {
    handleHideRemoved(msg, response)
  }
})