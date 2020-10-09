import {
    isValidTextNode
} from "./utils"


import { MAX_SEQUENCE_COUNT } from '../../constants'

/**
 * Algorithm for finding text nodes from a root with a granularity capped by @const MAX_SEQUENCE_COUNT
 *    
 * From the body tag, recursively sorts tags on text content length and replaces all tags
 * with their children until @const MAX_SEQUENCE_COUNT limit is reached
 */
export function extractNodes(rootNode) {
    const INVALID_TAG_NAMES = ["SCRIPT", "NOSCRIPT", "HTML"]
  
    const getRelevantChildren = node => {
      const validChildren = node.children ? [...(node.children)]
        .filter(isValidTextNode)
        .filter(c => !INVALID_TAG_NAMES.includes(c.nodeName)) : []
      return validChildren
    }
  
    let nodes = getRelevantChildren(rootNode)
    let withinAllowedNodeCount = true
  
    while (withinAllowedNodeCount) {
      // sort nodes in reverse order
      nodes = nodes.sort((a, b) => a.innerText && b.innerText ? b.innerText.length - a.innerText.length : 0)
  
      // keep track of changes made, in case we are never able to fill up the MAX_SEQUENCE_COUNT
      let changesMadeThisIteration = false
  
      // loop through nodes in reverse order
      // as long as we're not past the limit, replace each node with its children
      for (let i = nodes.length - 1; i >= 0; i--) {
        const childReplacements = getRelevantChildren(nodes[i])
  
        if (nodes.length + childReplacements.length - 1 > MAX_SEQUENCE_COUNT) {
          withinAllowedNodeCount = false
          break
        } else if (childReplacements.length > 0) {
          nodes.splice(i, 1)
          nodes = nodes.concat(childReplacements)
          changesMadeThisIteration = true
        }
      }
      if (!changesMadeThisIteration) break
    }
  
    return nodes
  }