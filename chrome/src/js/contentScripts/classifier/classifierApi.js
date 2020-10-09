import regeneratorRuntime from "regenerator-runtime";
import {
    OBSCURE_THRESHOLD
} from "../../constants"
import {
    BASE_URL
} from "../../../../utils/env"

/**
 * Calls the `/classify` api with the @param sequences and @param labels provided 
 * and maps the result to the `entry` type
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
 *       "hide_override": true|false|null
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
    Object.keys(response).map((key, idx) => {
        const hide = Object.keys(response[key]).some(label => response[key][label] >= OBSCURE_THRESHOLD && labels.includes(label))
        response[key] = {
            classificationResults: {
                ...response[key]
            }
        }
        if (hide) {
            response[key].decision = {
                hide: true
            }
        }

        console.log("Converted to cache object", response[key])
    })

    return response
}