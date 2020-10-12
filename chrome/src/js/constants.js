// How many sequences are allowed when first parsing a webpage
export const MAX_SEQUENCE_COUNT = 50

// Minimum text length for text sent to classifier
export const MIN_TEXT_LENGTH = 10

// Max length allowed for the ML model
export const MAX_TEXT_LENGTH = 1024

// How certain the classifier has to be that a certain label should be obscured
export const OBSCURE_THRESHOLD = 0.6

// How often to sync local cache with chrome storage
export const CACHE_UPDATE_INTERVAL_MILLIS = 20_000

/**
 * Content Script IDs
 */
export const CLASSIFIER_ID = "classifier.bundle.js"