import regeneratorRuntime from "regenerator-runtime";
import {
    OBSCURE_THRESHOLD
} from "../../constants"
import {
    BASE_URL
} from "../../../../utils/env"

/**
 * Calls the /classify api with the @param sequences and labels from chrome storage
 * 
 * --- api object: ---
 * {
 *   "key" {
 *     "label1": score,
 *     "label2": score,
 *     ...   
 *   },
 *   ...
 * }
 * --- returned object: ---
 * {
 *   "key" {
 *     "classification_results": {
 *       "label1": score,
 *       "label2": score,
 *       ...   
 *     }, 
 *     "decision": {
 *       "hide": true|false,
 *       "override": true|false
 *     }
 *   },
 *   ...
 * }
 */
export async function classify(sequences, labels) {
    if (Object.keys(sequences).length === 0) return {}
    if (labels.length === 0) throw new Error("Need to add at least one label")

    return fetch(`${BASE_URL}/classify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                sequences: sequences,
                labels: labels
            })
        }).then(response => response.json())
        .then(responseBody => convertToCacheObject(responseBody, labels))
}

const convertToCacheObject = (response, labels) => {
    console.log("Response from api is ", response)
    Object.keys(response).map((key, idx) => {
        response[key] = {
            classificationResults: {
                ...response[key]
            },
            decision: {
                hide: Object.keys(response[key]).some(label => response[key][label] >= OBSCURE_THRESHOLD && labels.includes(label))
            }
        }
    })

    console.log("Mapped response is ", response)
    return response
}