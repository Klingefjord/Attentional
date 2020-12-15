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
    modal.setAttribute('id', 'attn__granularity-modal-menu')
    return modal
}

const createModalContent = () => {
    const modalContent = document.createElement('div')
    modalContent.setAttribute('id', 'attn__granularity-modal-content')
    return modalContent
}

const createSlider = (possibleNodes) => {
    const sliderContainer = document.createElement('div')
    sliderContainer.setAttribute('id', 'attn__granularity-slider-container')

    const slider = document.createElement('input')
    slider.setAttribute('type', 'range')
    slider.setAttribute('min', '0')
    slider.setAttribute('max', '99')
    slider.setAttribute('value', '0')
    slider.setAttribute('id', 'attn__granularity-slider')

    sliderContainer.appendChild(slider)

    slider.oninput = () => {
        possibleNodes.forEach(n => n.style.display = '')
        const node = currentNode(slider.value, possibleNodes)
        if (node) node.style.display = 'none'
    }

    return sliderContainer
}

const createFinishButton = (finishCallback, possibleNodes) => {
    const button = document.createElement('button')
    button.setAttribute('id', 'attn__finish_button')
    button.innerHTML = "Remove element"

    button.onclick = _ => {
        const slider = document.getElementById('attn__granularity_slider')
        finishCallback(currentNode(slider.value, possibleNodes))
    }

    return button
}

const createCancelButton = (cancelCallback, possibleNodes) => {
    const button = document.createElement('button')
    button.setAttribute('id', 'attn__cancel_button')
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