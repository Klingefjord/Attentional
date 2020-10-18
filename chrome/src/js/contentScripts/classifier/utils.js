import { MIN_TEXT_LENGTH } from '../../constants'
const crypto = require('crypto')

export function nodeText(node) {
    return cleanText(node.innerText)
}
  
export function nodeKey(node) {
    return `attn_${hashCode(nodeText(node))}`
}
  
export function isValidTextNode(node) {
    return isValidStr(nodeText(node), MIN_TEXT_LENGTH)
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

export function hashCode(str) {
    let shasum = crypto.createHash('sha1')
    shasum.update(str)
    return shasum.digest('hex')
}