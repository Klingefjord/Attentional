const LABELS_CACHE_KEY = "labels"
const HOSTS_CACHE_KEY = "hosts"
const CLASSIFICATION_CACHE_KEY = "clf_cache"
const REMOVED_FEATURES_CACHE_KEY = "rm_feat"
const PENDING_EXTRACTION_KEY = "pnd_extr"
const FEED_READ_ITERATION_KEY = "feed_read_itr"
const SEQUENCES_PENDING_EXTRACTION_KEY = "seq_pending_extr"

const classificationKey = host => `${CLASSIFICATION_CACHE_KEY}__${host}`
const removedFeaturesKey = host => `${REMOVED_FEATURES_CACHE_KEY}__${host}`
const pendingExtractionKey = host => `${PENDING_EXTRACTION_KEY}__${host}`
const feedReadIterationKey = host => `${FEED_READ_ITERATION_KEY}__${host}`
const sequencesPendingExtractionKey = host => `${SEQUENCES_PENDING_EXTRACTION_KEY}__${host}`

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

export const getHosts = () => get(HOSTS_CACHE_KEY, [])
export const setHosts = hosts => set(HOSTS_CACHE_KEY, hosts)

export const getFeedReadIteration = host => get(feedReadIterationKey(host), { iteration: 0 }).then(obj => obj.iteration)
export const setFeedReadIteration = (host, iteration) => set(feedReadIterationKey(host), { iteration: iteration })

export const getSequencesPendingExtraction = host => get(sequencesPendingExtractionKey(host), [])
export const setSequencesPendingExtraction = (host, sequencesPendingExtraction) => set(sequencesPendingExtractionKey(host), sequencesPendingExtraction)

export const getPendingExtraction = host => get(pendingExtractionKey(host), { pending: false }).then(obj => obj.pending)
export const setPendingExtraction = (host, data) => set(pendingExtractionKey(host), { pending: data })

export const getClassificationResults = host => get(classificationKey(host), {})
export const setClassificationResults = (host, data) => set(classificationKey(host, data))

export const getRemovedFeatures = host => get(removedFeaturesKey(host), [])
export const setRemovedFeatures = (host, data) => set(removedFeaturesKey(host), data)