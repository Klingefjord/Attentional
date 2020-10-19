export const modal = (possibleNodes, finishCallback, cancelCallback) => {
    const modal = createModal()
    const modalContent = createModalContent()
    const slider = createSlider(possibleNodes)
    const finishButton = createFinishButton(finishCallback, possibleNodes)
    const cancelButton = createCancelButton(cancelCallback, possibleNodes)

    modalContent.appendChild(slider)
    modalContent.appendChild(finishButton)
    modalContent.appendChild(cancelButton)
    modal.appendChild(modalContent)
    return modal;
}

const createModal = () => {
    const modal = document.createElement('div')
    modal.setAttribute('id', 'attn-granularity-modal')
    modal.classList.add('modal')
    modal.style.cssText = `
            margin: 0;
            padding: 0;
            display: block;
            position: fixed;
            z-index: 100000;
            right: 0;
            top: 0;
            overflow: auto;
            background-color: rgba(0,0,0, 0);
            animation-name: modalopen;
            animation-duration: 0.5s;`

    return modal
}

const createModalContent = () => {
    const modalContent = document.createElement('div')
    modalContent.classList.add('modal-content')
    modalContent.style.cssText = `
            background-color: #f4f4f4;
            margin: 3vw;
            position: relative;
            float: right;
            padding: 20px;
            width: 20vw;
            height: 5vh;
            border-radius: 5px;`

    return modalContent
}

const createSlider = (possibleNodes) => {
    possibleNodes = possibleNodes.filter(n => !n.contains(document.getElementById('attn-granularity-modal')))
    const sliderContainer = document.createElement('div')
    sliderContainer.classList.add('slider-container')
    sliderContainer.style.cssText = `margin: 0 auto;`

    const slider = document.createElement('input')
    slider.setAttribute('type', 'range')
    slider.setAttribute('min', '0')
    slider.setAttribute('max', '99')
    slider.setAttribute('value', '0')
    slider.setAttribute('id', 'attn-slider')
    slider.style.cssText = `width: 100%;`

    sliderContainer.appendChild(slider)

    slider.oninput = () => {
        possibleNodes.forEach(n => {
            n.style.display = ''
        })

        const node = currentNode(slider.value, possibleNodes)
        if (node) node.style.display = 'none'
    }

    return sliderContainer
}

const createFinishButton = (finishCallback, possibleNodes) => {
    possibleNodes = possibleNodes.filter(n => !n.contains(document.getElementById('attn-granularity-modal')))
    const button = document.createElement('button')
    button.classList.add('finish-button')
    button.style.cssText = `width: 100%`
    button.innerHTML = "Remove element"

    button.onclick = _ => {
        const slider = document.getElementById('attn-slider')
        finishCallback(currentNode(slider.value, possibleNodes))
    }

    return button
}

const createCancelButton = (cancelCallback, possibleNodes) => {
    possibleNodes = possibleNodes.filter(n => !n.contains(document.getElementById('attn-granularity-modal')))
    const button = document.createElement('button')
    button.classList.add('cancel-button')
    button.style.cssText = `width: 100%;`
    button.innerHTML = "Cancel"

    button.onclick = _ => {
        possibleNodes.forEach(n => {
            n.style.display = ''
        })

        cancelCallback()
    }

    return button
}

const currentNode = (sliderValue, possibleNodes) => {
    const index = Math.floor(normalize(sliderValue, possibleNodes.length, 100))
    return possibleNodes.length > index ? possibleNodes[index] : null
}

const normalize = (value, x, y) => value * x / y;