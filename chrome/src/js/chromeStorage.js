const LABELS_CACHE_KEY = "labels"
const CLASSIFICATION_CACHE_KEY = "clf_cache"
const REMOVED_FEATURES_CACHE_KEY = "rm_feat"

const classificationKey = host => `${CLASSIFICATION_CACHE_KEY}__${host}`
const removedFeaturesKey = host => `${REMOVED_FEATURES_CACHE_KEY}__${host}`


/**
 * Wrapper for chrome storage 
 */

function get(key, fallback) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], result => {
            const error = chrome.runtime.lastError;
            if (error) reject(error)
            resolve(result[key] ? result[key] : fallback)
        })
    })
}

function set(key, data) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({
            [key]: data
        }, () => {
            const error = chrome.runtime.lastError
            if (error) reject(error)
            resolve()
        })
    })
}

export function clear() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.clear(() => {
            const error = chrome.runtime.lastError;
            if (error) reject(error)
            resolve()
        })
    })
}

export const getLabels = () => get(LABELS_CACHE_KEY, [])
export const setLabels = labels => set(LABELS_CACHE_KEY, labels)

export const getClassificationResults = host => get(classificationKey(host), {})
export const setClassificationResults = (host, data) => set(classificationKey(host, data))

export const getRemovedFeatures = host => get(removedFeaturesKey(host), [])
export const setRemovedFeatures = (host, data) => set(removedFeaturesKey(host), data)