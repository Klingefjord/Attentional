const LABELS_CACHE_KEY = "labels"
const CLASSIFICATION_CACHE_KEY = "clf_cache"

const classificationKey = host => `${CLASSIFICATION_CACHE_KEY}__${host}`


/**
 * Wrapper for chrome storage
 * 
 * Might have to change this to `chrome.storage.local` eventually, as .sync only allows 104KB whereas .local allows 5.2MB
 */

export function clear() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.clear(() => {
            const error = chrome.runtime.lastError;
            if (error) reject(error)
            resolve()
        })
    })
}

export function getLabels() {
    return new Promise((resolve, reject) => {
        const key = LABELS_CACHE_KEY
        chrome.storage.local.get([key], result => {
            const error = chrome.runtime.lastError;
            if (error) reject(error)
            resolve(result[key] ? result[key] : [])
        })
    })
}

export function setLabels(labels) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({
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
        chrome.storage.local.get([key], result => {
            const error = chrome.runtime.lastError
            if (error) reject(error)
            resolve(result[key] ? result[key] : {})
        })
    })
}

export function setCachedClassificationResults(host, classificationCache) {
    const key = classificationKey(host)
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({
            [key]: classificationCache
        }, () => {
            const error = chrome.runtime.lastError
            if (error) reject(error)
            resolve()
        })
    })
}