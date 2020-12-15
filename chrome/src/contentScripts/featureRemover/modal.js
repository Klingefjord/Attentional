export const modal = (possibleNodes, finishCallback, cancelCallback) => {
    const modal = createModal()
    const modalContent = createModalContent()

    modalContent.appendChild(createHeader())
    modalContent.appendChild(createSlider(possibleNodes))
    modalContent.appendChild(createSeparator())
    modalContent.appendChild(createFinishButton(finishCallback, possibleNodes))
    modalContent.appendChild(createCancelButton(cancelCallback, possibleNodes))
    modal.appendChild(modalContent)

    return modal
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

const createHeader = () => {
    const header = document.createElement('h2')
    header.setAttribute('id', 'attn__granularity-modal-header')
    header.innerHTML = "Keep sliding until things look good..."
    return header
}

const createSeparator = () => {
    const separator = document.createElement('div')
    separator.setAttribute('id', 'attn__granularity-modal-separator')
    return separator
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
        slider.style.background = 'linear-gradient(to right, #9C12F8 0%, #9C12F8 ' + slider.value + '%, #E2E2E2 ' + slider.value + '%, #E2E2E2 100%)'
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