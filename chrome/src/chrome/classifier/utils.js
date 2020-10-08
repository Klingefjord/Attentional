import {
    isValidStr,
    hashCode,
    cleanText
} from "../../app/utils"

export function nodeText(node) {
    return cleanText(node.innerText ? node.innerText : node.textContent)
}
  
export function nodeKey(node) {
    return `attn_${hashCode(nodeText(node))}`
}
  
export function isValidTextNode(node) {
    return isValidStr(nodeText(node), MIN_TEXT_LENGTH)
}