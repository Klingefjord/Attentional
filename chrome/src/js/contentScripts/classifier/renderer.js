import {
    OBSCURE_THRESHOLD, ONLY_SHOW_CLASSIFIED_CONTENT
} from "../../constants"
import {
    hashCode
} from "./utils"

/**
 * Hides nodes if its classified text for any label surpasses @constant OBSCURE_THRESHOLD
 */
export function render(node, classificationResults, classificationResultsOverrides) {
    const id = hashCode(node)
    const matchedClassificationResults = classificationResults.filter(cr => cr.sequence_hash === id)
    const getRelevantSibling = (n, recursionDepth = 0) => {
        const candidate = n.parentElement && [...n.parentElement.children].length === 1 && recursionDepth < 3 
            ? getRelevantSibling(n.parentElement, ++recursionDepth) 
            : n.previousElementSibling

        const ignore = candidate && candidate.textContent && (candidate.textContent.toLowerCase() === "show this thread" || candidate.textContent.toLowerCase() === "show more replies")

        return ignore ? candidate.previousElementSibling : candidate
    }
    const relevantSibling = getRelevantSibling(node)

    if (!matchedClassificationResults || matchedClassificationResults.length === 0) {
        if (ONLY_SHOW_CLASSIFIED_CONTENT) hideNode(node, id, "Not classified yet", true)
        return
    } else if (relevantSibling && relevantSibling.dataset.attn_no_border) {
        hideNode(node, id, relevantSibling.dataset.attn_reason, true)
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

    if (shouldHide) hideNode(node, id, reason, true)
}

const hideNode = (node, id, reason, recursive, recursionDepth = 0) => {
    if (recursive && node.parentElement && [...node.parentElement.children].length === 1 && recursionDepth < 3) {
        hideNode(node.parentElement, id, reason, true, ++recursionDepth)
    } else {
        const hasBottomBorder = node.clientHeight !== node.offsetHeight
        if (!hasBottomBorder) node.dataset.attn_no_border = true
        node.dataset.attn_reason = reason
        node.classList.add("attn_obscured_content")
        node.classList.add(`attn_obs_${id}`)
        node.dataset.attn_id = id
        node.style.display = 'none'
    }
}

const reasonString = (node, classificationResult) => {
    const classificationString = `${classificationResult.label} (${Math.round(classificationResult.score * 100)}% certainty)`
    return node.dataset.attn_reason ? `${node.dataset.attn_reason} | ${classificationString}` : classificationString
}