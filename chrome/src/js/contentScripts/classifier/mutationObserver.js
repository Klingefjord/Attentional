import {
  ignoreableNode,
  isValidTextNode
} from './utils'

// Global state
var addedNodesQueue = []
var removedNodesQueue = []

const QUEUE_INTERVALS = [500, 1000, 2000]

/**
 * Adds a mutation listener to the @param rootNode listening for addChildren events 
 * Either a removedNodesCallback or removedNodesQueueCallback has to passed to this method
 * Either a addedNodesCallback or addedNodesQueueCallback has to be passed to this method
 */
export function registerMutationObserver(rootNode, addedNodesCallback, removedNodesCallback, addedNodesQueueCallback, removedNodesQueueCallback) {
  const config = {
    attributes: false,
    childList: true,
    subtree: true
  }

  // Register queues if suitable callbacks exist
  if (addedNodesQueueCallback) registerUpdateQueue(addedNodesQueueCallback, addedNodesQueue)
  if (removedNodesQueueCallback) registerUpdateQueue(removedNodesQueueCallback, removedNodesQueue)

  const observationHandler = (mutationsList, _) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const addedArticles = [...mutation.addedNodes]
          .filter(n => n.querySelector('article'))
          .map(n => n.querySelector('article'))

        const removedArticles = [...mutation.removedNodes]
          .filter(n => n.querySelector('article'))
          .map(n => n.querySelector('article'))

        if (addedArticles.length > 0) {
          if (addedNodesQueueCallback) addedNodesQueue.push(...addedArticles)
          if (addedNodesCallback) addedNodesCallback(addedArticles)
        }

        if (removedArticles.length > 0) {
          if (removedNodesQueueCallback) removedNodesQueue.push(...removedArticles)
          if (removedNodesCallback) removedNodesCallback(removedArticles)
        }

        [...mutation.addedNodes].filter(ignoreableNode)
          .map(n => {
            n.style.display = 'none'
          })
      }
    }
  }

  const observer = new MutationObserver(observationHandler);

  // Start observing the target node for configured mutations
  observer.observe(rootNode, config);
}

/// Queue (only enabled if a relevant callback was passed when registering the mutation observer)
const interval = updateIndex => updateIndex < QUEUE_INTERVALS.length ? QUEUE_INTERVALS[updateIndex] : QUEUE_INTERVALS[QUEUE_INTERVALS.length - 1]

const registerUpdateQueue = (callback, queue) => {
  updateQueue(0, callback, queue)
}

const updateQueue = (index, callback, queue) => {
  setTimeout(() => {
    // Clear array without losing the reference and pass a copy instead
    const copy = [...queue]
    queue.length = 0

    if (copy.length > 0) {
      callback(copy)
    }

    // Call this method recursively
    updateQueue(++index, callback, queue)
  }, interval(index))
}