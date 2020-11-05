// How many sequences are allowed when first parsing a webpage
export const MAX_SEQUENCE_COUNT = 50

// Minimum text length for text sent to classifier
export const MIN_TEXT_LENGTH = 10

// Max length allowed for the ML model
export const MAX_TEXT_LENGTH = 1024

// How certain the classifier has to be that a certain label should be obscured
export const OBSCURE_THRESHOLD = 0.6

// How much of a text blob needs to pass the @constant OBSCURE_THRESHOLD
export const TEXT_PERCENTAGE_THRESHOLD = 0.3

// How often to sync local cache with chrome storage
export const CACHE_UPDATE_INTERVAL_MILLIS = 10_000

export const POLLING_INTERVAL = 240_000

export const TIMER_INTERVAL_MILLIS = 10_000

export const EXTRACTOR_SCROLL_COUNT = 5

export const FEED_READ_COUNT = 2

export const ONLY_SHOW_CLASSIFIED_CONTENT = true

/**
 * Content Script IDs
 */
export const LEGACY_CLASSIFIER_CONTENT_SCRIPT = "runtimeClassifier.bundle.js"
export const FEATURE_REMOVER_CONTENT_SCRIPT = "featureRemover.bundle.js"
export const CLASSIFIER_CONTENT_SCRIPT = "serverClassifier.bundle.js"
export const EXTRACTOR_CONTENT_SCRIPT = "extractor.bundle.js"
export const TIMER_CONTENT_SCRIPT = "timer.bundle.js"