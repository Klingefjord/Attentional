import regeneratorRuntime from "regenerator-runtime";
import {
    OBSCURE_THRESHOLD
} from "../../app/constants.js"
import {
    BASE_URL
} from "../../../utils/env"

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
export default async function classify(sequences, labels) {
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

const convertToCacheObject = (apiResponse, labels) =>
    Object.keys(apiResponse).map((key, idx) => {
        apiResponse[key] = {
            classificationResults: {
                ...apiResponse[key]
            },
            decision: {
                hide: Object.keys(apiResponse[key]).some(label => apiResponse[key][label] >= OBSCURE_THRESHOLD && labels.includes(label))
            }
        }
    })