// import {
//     FETCH_HIDDEN,
//     SHOW_ELEMENT
// } from '../../app/messages.js'
// import { cleanText } from '../../app/utils.js'

// // alert("fetch nodes")

// // export const ID = "fetchNodes.bundle.js"

// chrome.extension.onMessage.addListener((msg, sender, sendResponse) => {
//     if (msg.action === FETCH_HIDDEN) {
//         const hiddenNodes = [...document.querySelectorAll("[class^=attn_]")]
//         .filter(n => n.style.display === 'none')
//         .map(n => {
//             console.log(n.innerText)
//             return {
//                 key: [...n.classList].filter(className => /attn_[\d-]+/.test(className))[0],
//                 text: cleanText(n.innerText ? n.innerText : n.textContent)
//             }
//         })
//         sendResponse(hiddenNodes)
//     } else if (msg.action === SHOW_ELEMENT) {
//         [...document.getElementsByClassName(msg.key)].forEach(n => n.style.display = '')
//         return msg
//     }
// })
// //