// Triggered from the `ShowHiddenContentView` when a hidden element is supposed to be shown
export const UPDATE_HIDDEN = "update_override"

// Triggered when the user adds or removes a label
export const LABEL_UPDATE = "label_update"

// Triggered from the hidden view as a way to fetch content that is currently hidden
export const FETCH_HIDDEN = "fetch_hidden_content"

// Triggered when we no longer want the classifier to monitor the DOM for changes
export const RELOAD = "reload"