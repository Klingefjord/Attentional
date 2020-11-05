import {
    OBSCURE_THRESHOLD,
    ONLY_SHOW_CLASSIFIED_CONTENT
} from "../../constants"
import {
    hashCode,
    ignoreableNode
} from "./utils"

/**
 * Hides nodes if its classified text for any label surpasses @constant OBSCURE_THRESHOLD
 */
export function render(node, classificationResults, classificationResultsOverrides) {
    const id = hashCode(node)
    const matchedClassificationResults = classificationResults.filter(cr => cr.sequence_hash === id)
    const topLevelContainer = getTopLevelContainer(node)
    const getRelevantSibling = (node, recursionDepth = 0) =>
        ignoreableNode(node.previousElementSibling) && recursionDepth < 3 ?
        getRelevantSibling(node.previousElementSibling, ++recursionDepth) :
        node.previousElementSibling

    const relevantSibling = getRelevantSibling(topLevelContainer)

    if (!matchedClassificationResults || matchedClassificationResults.length === 0) {
        if (ONLY_SHOW_CLASSIFIED_CONTENT) hideNodeAndPreceedingSiblings(topLevelContainer, id, "Not classified yet")
        return
    } else if (relevantSibling && relevantSibling.dataset.attn_no_border) {
        // Hide nodes after a removed node without a border (meaning it is part of a thread)
        hideNode(topLevelContainer, relevantSibling.dataset.attn_reason, id)
        return
    }

    const override = classificationResultsOverrides.find(cr => cr.id === id)
    let shouldHide = false
    let reason = ""

    matchedClassificationResults.forEach(classificationResult => {
        const passingThreshold = classificationResult.score >= OBSCURE_THRESHOLD
        const hide = override === null ? override : passingThreshold
        console.log(classificationResult.score)
        if (hide) {
            reason = reasonString(node, classificationResult)
            shouldHide = true
        }
    })

    if (shouldHide) hideNodeAndPreceedingSiblings(topLevelContainer, id, reason)
}

const getTopLevelContainer = (node, recursionDepth = 0) => {
    return node.parentElement && [...node.parentElement.children].length === 1 && recursionDepth < 3 ?
        getTopLevelContainer(node.parentElement, ++recursionDepth) :
        node
}

const hideNodeAndPreceedingSiblings = (node, id, reason) => {
    // A thread consist of a series of nodes, and the last node will have a border.
    // To hide nodes after the classified node, see above.
    // To hide nodes above classified node, recursively check if the previous sibling
    // has a border
    const hideNodesAbove = (n, rd = 0) => {
        if (n.previousElementSibling && ignoreableNode(n.previousElementSibling)) {
            hideNodesAbove(n.previousElementSibling, rd)
        } else if (n.previousElementSibling && missingBottomBorder(n.previousElementSibling) && rd < 3) {
            hideNode(n.previousElementSibling, reason, id)
            hideNodesAbove(n.previousElementSibling, ++rd)
        }
    }

    hideNode(node, reason, id)
    hideNodesAbove(node)
}

const missingBottomBorder = node => {
    return node.firstElementChild.clientHeight !== 0 && node.firstElementChild.clientHeight === node.firstElementChild.offsetHeight
}

const hideNode = (node, reason, id) => {
    if (missingBottomBorder(node)) node.dataset.attn_no_border = true
    node.dataset.attn_reason = reason
    node.classList.add("attn_obscured_content")
    node.classList.add(`attn_obs_${id}`)
    node.style.display = 'none'
}

const reasonString = (node, classificationResult) => {
    const classificationString = `${classificationResult.label} (${Math.round(classificationResult.score * 100)}% certainty)`
    return node.dataset.attn_reason ? `${node.dataset.attn_reason} | ${classificationString}` : classificationString
}