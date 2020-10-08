/**
 * Adds a mutation listener to the @param rootNode listening for addChildren events 
 * and calling @function updateNodes for all new added nodes
 */
export default function registerMutationObserver(rootNode, callback) {
    const config = {
      attributes: false,
      childList: true,
      subtree: true
    }
  
    const callback = (mutationsList, observer) => {
      if (labels.length === 0) return
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes && mutation.addedNodes.length > 0) {
            callback([...mutation.addedNodes].filter(isValidTextNode))
        }
      }
    }
  
    const observer = new MutationObserver(callback);
  
    // Start observing the target node for configured mutations
    observer.observe(rootNode, config);
  }