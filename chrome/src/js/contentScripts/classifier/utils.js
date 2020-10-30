import { MIN_TEXT_LENGTH } from '../../constants'
const crypto = require('crypto')

export function textForClassification(node) {
    [...node.getElementsByTagName('time')].forEach(timeNode => timeNode.remove())
    Array.from(node.querySelectorAll('[role="group"]')).forEach(groupNode => groupNode.remove())
    return cleanText(node.textContent)
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
    // Remove spaces and digits for the hash string to be tolerant of small variations
    const text = textForClassification(node).replace(/\s/g, '').replace(/\d/g,'')
    let shasum = crypto.createHash('sha1')
    shasum.update(text)
    return shasum.digest('hex')
}