import {
    OBSCURE_THRESHOLD
} from "../../constants"
import {
    hashCode
} from "./utils"

/**
 * Hides nodes if the average of its classified text nodes surpasses @constant OBSCURE_THRESHOLD
 */
export function render(nodes, classificationResults, classificationResultsOverrides) {
    nodes.forEach(node => {
        const matchedClassificationResults = getMatchingClassificationResults(node, classificationResults)

        if (matchedClassificationResults.length === 0) return
        const labels = matchedClassificationResults.reduce((acc, cr) => {
            if (acc[cr.label]) {
                acc[cr.label].push(cr)
            } else {
                acc[cr.label] = [cr]
            }
            return acc
        }, {})

        let labelsAndScore = []
        
        const id = jointId(matchedClassificationResults)

        Object.keys(labels).forEach(label => {
            const labelAndScore = {
                label: label,
                score: labels[label].reduce((acc, cr) => cr.score + acc, 0) / labels[label].length
            }

            labelAndScore.passingThreshold = labelAndScore.score >= OBSCURE_THRESHOLD
            labelsAndScore.push(labelAndScore)
        })

        const override = classificationResultsOverrides.includes(cr => cr.id === highestResult.id) ?
            classificationResultsOverrides.find(cr => cr.id === highestResult.id).hide :
            null

        const hide = override === null ? labelsAndScore.some(l => l.passingThreshold) : override
        if (hide) {
            node.classList.add("attn_obscured_content")
            node.classList.add(`attn_obs_${id}`)
            node.dataset.attn_reason = labelsAndScore.filter(l => l.passingThreshold).map(l => `${l.label} (${Math.round(l.score * 100)}% certainty)`).join(", ")
            node.dataset.attn_id = id
            node.hidden = true
        } else {
            node.hidden = false
        }
    })
}

const jointId = classificationResults => hashCode(classificationResults.sort((a, b) => a.score - b.score).map(cr => cr.id).join(""))

const getMatchingClassificationResults = (node, classificationResults) => {
    return textNodesUnder(node).reduce((acc, textNode) => {
        const sequenceHash = hashCode(textNode.textContent)
        const resultsForSequenceHash = classificationResults.filter(cr => cr.sequence_hash === sequenceHash)
        if (resultsForSequenceHash.length > 0) {
            acc = acc.concat(resultsForSequenceHash)
        }
        return acc
    }, [])
}

const textNodesUnder = (el) => {
    var n, a = [],
        walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    while (n = walk.nextNode()) a.push(n);
    return [...a];
}