const LABELS_CACHE_KEY = "labels"
const CLASSIFICATION_CACHE_KEY = "clf_cache"

const classificationKey = host => `${CLASSIFICATION_CACHE_KEY}__${host}`


/**
 * Wrapper for chrome storage
 * 
 * Might have to change this to `chrome.storage.local` eventually, as .sync only allows 104KB whereas .local allows 5.2MB
 */

export function getLabels() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([LABELS_CACHE_KEY], labelObj => {
            const error = chrome.runtime.lastError;
            if (error) reject(error)
            resolve(labelObj.labels ? labelObj.labels : [])
        })
    })
}

export function setLabels(labels) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({
            [LABELS_CACHE_KEY]: labels
        }, () => {
            const error = chrome.runtime.lastError;
            if (error) reject(error)
            resolve()
        })
    })
}

export function getCachedClassificationResults(host) {
    const key = classificationKey(host)
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([key], classificationCache => {
            const error = chrome.runtime.lastError;
            if (error) reject(error)
            resolve(classificationCache[key] ? classificationCache[key] : {})
        })
    })
}

export function setCachedClassificationResults(host, classificationCache) {
    const key = classificationKey(host)
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({
            [key]: classificationCache
        }, () => {
            const error = chrome.runtime.lastError;
            if (error) reject(error)
            resolve()
        })
    })
}