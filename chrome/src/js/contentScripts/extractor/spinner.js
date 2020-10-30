export const spinner = host => {
    const spinnerContainer = document.createElement('div')
    spinnerContainer.setAttribute('id', 'attn_spinner-container')
    spinnerContainer.style.cssText = `
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(14, 14, 16, 0.87);
            display: block;
            position: fixed;
            z-index: 100000;
            overflow: auto;`

    spinnerContainer.appendChild(centerText(host))
    return spinnerContainer
}

const centerText = host => {
    const h1 = document.createElement('h1')
    const text = document.createTextNode(`Attentional is reading through your ${host.replace(".com", "")} feed, the site will be available in a minute`)
    h1.appendChild(text);  
    h1.style.cssText = `
        position: fixed;
        top: 40vh;
        width: 100vw;
        text-align: center;
        color: white;
        font-size: 2rem;
        font-family: roboto;
    `
    return h1
}