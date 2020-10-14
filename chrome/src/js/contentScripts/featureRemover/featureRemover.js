import regeneratorRuntime from "regenerator-runtime";

import {
  REMOVE_SELECTED_ELEMENT
} from '../../messages';

import {
  getRemovedFeatures,
  setRemovedFeatures
} from '../../chromeStorage'

import {
  cssPath
} from "./utils";

var cache;
var selectedElement;

(function () {
  updateCache()
    .then(hideElementsFromCache)
    .then(() => {
      setupEventListener()
      registerMutationObserver(document.getElementsByTagName("body")[0])
    })
})()

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
    cache.forEach(selector => {
      const node = document.querySelector(selector)
      if (node) removeElement(node)
    })
  }

  const observer = new MutationObserver(observationHandler);

  // Start observing the target node for configured mutations
  observer.observe(rootNode, config);
}

/// Cache
async function updateCache() {
  return getRemovedFeatures(window.location.host)
    .then(removedFeatures => {
      cache = removedFeatures
    })
}

/// Event listeners
function handleElementRemoval(msg, response) {
  getRemovedFeatures(window.location.host)
    .then(cache => setRemovedFeatures(window.location.host, [...cache, cssPath(selectedElement)]))
    .then(updateCache)
    .then(() => {
      cache
      removeElement(selectedElement)
      selectedElement = null
    })
    .then(() => response(true))
}

chrome.extension.onMessage.addListener((msg, sender, response) => {
  if (msg.action === REMOVE_SELECTED_ELEMENT) {
    handleElementRemoval(msg, response)
  }
})