import {
  isValidTextNode
} from './utils'

/**
 * Adds a mutation listener to the @param rootNode listening for addChildren events 
 * and calling @function updateNodes for all new added nodes
 */
export function registerMutationObserver(rootNode, labels, callback) {
    const config = {
      attributes: false,
      childList: true,
      subtree: true
    }
  
    const observationHandler = (mutationsList, observer) => {
      if (labels.length === 0) return
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes && mutation.addedNodes.length > 0) {
            callback([...mutation.addedNodes].filter(isValidTextNode))
        }
      }
    }
  
    const observer = new MutationObserver(observationHandler);
  
    // Start observing the target node for configured mutations
    observer.observe(rootNode, config);
  }