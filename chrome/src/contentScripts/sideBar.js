import {
    MODAL_MENU_ID
} from './modal'

import {
    SIDEBAR_ID
} from '../constants'

(function() {
    const sidebar = document.getElementById(SIDEBAR_ID)

    if (sidebar) {
        sidebar.remove()
    } else {
        if (document.getElementById(MODAL_MENU_ID)) {
            document.getElementById(MODAL_MENU_ID).remove()
        }
        const body = document.getElementsByTagName("body")[0]
        const container = document.createElement('div')
        container.setAttribute('id', SIDEBAR_ID)
        container.innerHTML=`<object type="text/html" data="${chrome.extension.getURL('/index.html')}" style="width: 100%; height: 100%;"></object>`
        body.insertBefore(container, body.firstChild)
    }
})()
