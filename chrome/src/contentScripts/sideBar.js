const SIDEBAR_ID = 'attn__sidebar'
const sidebar = document.getElementById(SIDEBAR_ID)

if (sidebar) {
    sidebar.remove()
} else {
    const body = document.getElementsByTagName("body")[0]
    const container = document.createElement('div')
    container.setAttribute('id', SIDEBAR_ID)
    container.innerHTML=`<object type="text/html" data="${chrome.extension.getURL('/index.html')}"></object>`
    body.insertBefore(container, body.firstChild)
}
