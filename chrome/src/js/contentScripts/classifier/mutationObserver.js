import {
  isValidTextNode
} from './utils'
import {
  STOP_LISTENING_FOR_MUTATIONS
} from '../../messages'

// Global state
var queue = []
var queueUpdate
var observer

const QUEUE_INTERVALS = [100, 200, 500, 1000, 2000]

/**
 * Adds a mutation listener to the @param rootNode listening for addChildren events 
 * and adds valid text nodes to the global @var queue while hiding them. 
 * The @param callback is called according to @constant QUEUE_INTERVALS 
 * with nodes currently living in @var queue
 */
export function registerMutationObserver(rootNode, cache, labels, prepareNodesCallback, classifyNodesCallback) {
  const config = {
    attributes: false,
    childList: true,
    subtree: true
  }

  registerUpdateQueue(classifyNodesCallback)

  const observationHandler = (mutationsList, observer) => {
    if (labels.length === 0) return
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes && mutation.addedNodes.length > 0) {
        const addedNodes = [...mutation.addedNodes].filter(isValidTextNode)
        if (addedNodes.length === 0) {
          continue
        //} else if (parentNodeHasDecision(addedNodes, cache)) {
        //  continue
        } else {
          prepareNodesCallback(addedNodes)
          queue = queue.concat(addedNodes)
        }
      }
    }
  }

  observer = new MutationObserver(observationHandler);

  // Start observing the target node for configured mutations
  observer.observe(rootNode, config);
}

export function unregisterMutationObserver() {
  if (queueUpdate) clearTimeout(queueUpdate)
  if (observer) observer.disconnect()
  queue = []
}

// TODO - FIX!
// const parentNodeHasDecision = (nodes, cache) => {
//   const decisionNodes = Object.keys(cache).reduce((acc, curr) => {
//     if (cache[curr].decision) {
//       return acc.concat([...document.getElementsByClassName(curr)])
//     } else {
//       return acc
//     }
//   }, [])

//   return nodes.some(n => decisionNodes.some(dn => dn.contains(n)))
// }

/// Queue
const interval = updateIndex => updateIndex < QUEUE_INTERVALS.length ? QUEUE_INTERVALS[updateIndex] : QUEUE_INTERVALS[QUEUE_INTERVALS.length - 1]

const registerUpdateQueue = updateNodes => {
  updateQueue(0, updateNodes)
}

const updateQueue = (updateIndex, updateNodes) => {
  queueUpdate = setTimeout(() => {
    console.log("Updating, queue is currently ", queue, " idx currently ", updateIndex)
    const queueCopy = [...queue]
    queue = []
    updateNodes(queueCopy)
    // Call this method recursively
    queueUpdate = updateQueue(++updateIndex, updateNodes)
  }, interval(updateIndex))
}