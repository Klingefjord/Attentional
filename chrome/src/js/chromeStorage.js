const LABELS_CACHE_KEY = "labels"
const SEQUENCES_CACHE_KEY = "sequences"

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

export function getSequenceCache() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([SEQUENCES_CACHE_KEY], sequenceObj => {
            const error = chrome.runtime.lastError;
            if (error) reject(error)
            resolve(sequenceObj.sequences ? sequenceObj.sequences : {})
        })
    })
}

export function setSequenceCache(sequenceCache) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({
            [SEQUENCES_CACHE_KEY]: sequenceCache
        }, () => {
            const error = chrome.runtime.lastError;
            if (error) reject(error)
            resolve()
        })
    })
}