import {
    FETCH_ACTIVE_ELEMENTS,
    SHOW_ELEMENT
} from '../messages.js'
import { cleanText } from '../utils.js'

chrome.extension.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === FETCH_ACTIVE_ELEMENTS) {
        const hiddenNodes = [...document.querySelectorAll("[class^=attn_]")]
        .filter(n => n.style.display === 'none')
        .map(n => {
            console.log(n.innerText)
            return {
                key: [...n.classList].filter(className => /attn_[\d-]+/.test(className))[0],
                text: cleanText(n.innerText ? n.innerText : n.textContent)
            }
        })
        sendResponse(hiddenNodes)
    } else if (msg.action === SHOW_ELEMENT) {
        [...document.getElementsByClassName(msg.key)].forEach(n => n.style.display = '')
        return msg
    }
})
