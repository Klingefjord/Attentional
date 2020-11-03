import {
    MIN_TEXT_LENGTH
} from '../../constants'
const crypto = require('crypto')

export function textForClassification(node) {
    let text = node.textContent.split('')

    const timeString = [...node.getElementsByTagName('time')].map(n => n.textContent).join('')
    const groupString = Array.from(node.querySelectorAll('[role="group"]')).map(n => n.textContent).join('')

    if (timeString && node.textContent.indexOf(timeString) !== -1) {
        text.splice(node.textContent.indexOf(timeString), timeString.length)
    }

    if (groupString && node.textContent.lastIndexOf(groupString) !== -1) {
        text.splice(node.textContent.lastIndexOf(groupString), groupString.length)
    }

    return cleanText(text.join(''))
}

export function nodeKey(node) {
    return `attn_${hashCode(node)}`
}

export function isValidTextNode(node) {
    return isValidStr(cleanText(node.textContent), MIN_TEXT_LENGTH)
}

export function cleanText(str) {
    return str ? str.replace(/[\n\r]+|[\s]{2,}/g, " ").toLowerCase() : ""
}

export function isValidStr(str, minLength) {
    return str && /[a-zA-Z]/.test(str) && str.replace(/[\n\r]+|[\s]{2,}/g, " ").length >= minLength
}

/**
 * Returns an array of @param len - sized chunks from @param str
 */
export function chunkify(str, len) {
    const size = Math.ceil(str.length / len)
    const r = Array(size)
    let offset = 0

    for (let i = 0; i < size; i++) {
        r[i] = str.substr(offset, len)
        offset += len
    }

    return r
}

export function unixTimestamp() {
    return Math.round(new Date().getTime())
}

export function hashCode(node) {
    // Remove spaces and digits for the hash string to
    const text = textForClassification(node).replace(/\s/g, '').replace(/\d/g, '')
    let shasum = crypto.createHash('sha1')
    shasum.update(text)
    return shasum.digest('hex')
}