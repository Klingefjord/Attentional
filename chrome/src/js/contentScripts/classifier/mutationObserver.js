import {
  isValidTextNode, nodeKey, nodeText
} from './utils'

/**
 * Adds a mutation listener to the @param rootNode listening for addChildren events 
 * and calling @function updateNodes for all new added nodes
 */
export function registerMutationObserver(rootNode, cache, labels, callback) {
  const config = {
    attributes: false,
    childList: true,
    subtree: true
  }

  const observationHandler = (mutationsList, observer) => {
    if (labels.length === 0) return
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes && mutation.addedNodes.length > 0) {
        const addedNodes = [...mutation.addedNodes].filter(isValidTextNode)
        if (addedNodes.length === 0) {
          continue
        } else if (parentNodeHasDecision(addedNodes, cache)) {
          continue
        } else {
          callback(addedNodes)
        }
      }
    }
  }

  const observer = new MutationObserver(observationHandler);

  // Start observing the target node for configured mutations
  observer.observe(rootNode, config);
}

const parentNodeHasDecision = (nodes, cache) => {
  const decisionNodes = Object.keys(cache).reduce((acc, curr) => {
    if (cache[curr].decision) {
      return acc.concat([...document.getElementsByClassName(curr)])
    } else {
      return acc
    }
  }, [])

  return nodes.some(n => decisionNodes.some(dn => dn.contains(n)))
}