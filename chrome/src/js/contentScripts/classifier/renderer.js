import {
    OBSCURE_THRESHOLD
} from "../../constants"
import {
    hashCode
} from "./utils"

/**
 * Hides nodes if its classified text for any label surpasses @constant OBSCURE_THRESHOLD
 */
export function render(node, classificationResults, classificationResultsOverrides) {
    const id = hashCode(node.textContent.replace(/\s/g, ''))
    const matchedClassificationResults = classificationResults.filter(cr => cr.sequence_hash === id)
    if (!matchedClassificationResults || matchedClassificationResults.length === 0) return
    const override = classificationResultsOverrides.find(cr => cr.id === id)
    let shouldHide = false

    matchedClassificationResults.forEach(classificationResult => {
        const passingThreshold = classificationResult.score >= OBSCURE_THRESHOLD
        const hide = override === null ? override : passingThreshold
        console.log(classificationResult.score)
        if (hide) {
            node.dataset.attn_reason = reasonString(node, classificationResult)
            shouldHide = true
        }
    })

    if (shouldHide) hideNode(node, id)
}

const hideNode = (node, id) => {
    node.classList.add("attn_obscured_content")
    node.classList.add(`attn_obs_${id}`)
    node.dataset.attn_id = id
    node.hidden = true
}

const reasonString = (node, classificationResult) => {
    const classificationString = `${classificationResult.label} (${Math.round(classificationResult.score * 100)}% certainty)`
    return node.dataset.attn_reason ? `${node.dataset.attn_reason} | ${classificationString}` : classificationString
}