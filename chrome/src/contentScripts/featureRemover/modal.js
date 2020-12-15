const 
    MODAL_MENU_ID       = 'attn__granularity-modal-menu',
    MODAL_CONTENT_ID    = 'attn__granularity-modal-content',
    MODAL_HEADER_ID     = 'attn__granularity-modal-header',
    MODAL_SEPARATOR_ID  = 'attn__granularity-modal-separator',
    SLIDER_CONTAINER_ID = 'attn__granularity-slider-container',
    SLIDER_ID           = 'attn__granularity-slider',
    FINISH_BUTTON_ID    = 'attn__granularity-finish-button',
    CANCEL_BUTTON_ID    = 'attn__granularity-cancel-button'

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
    modal.setAttribute('id', MODAL_MENU_ID)
    return modal
}

const createModalContent = () => {
    const modalContent = document.createElement('div')
    modalContent.setAttribute('id', MODAL_CONTENT_ID)
    return modalContent
}

const createHeader = () => {
    const header = document.createElement('h2')
    header.setAttribute('id', MODAL_HEADER_ID)
    header.innerHTML = "Keep sliding until things look good..."
    return header
}

const createSeparator = () => {
    const separator = document.createElement('div')
    separator.setAttribute('id', MODAL_SEPARATOR_ID)
    return separator
}

const createSlider = (possibleNodes) => {
    const sliderContainer = document.createElement('div')
    sliderContainer.setAttribute('id', SLIDER_CONTAINER_ID)

    const slider = document.createElement('input')
    slider.setAttribute('type', 'range')
    slider.setAttribute('min', '0')
    slider.setAttribute('max', '99')
    slider.setAttribute('value', '0')
    slider.setAttribute('id', SLIDER_ID)

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
    button.setAttribute('id', FINISH_BUTTON_ID)
    button.innerHTML = "Remove element"

    button.onclick = _ => {
        const slider = document.getElementById(SLIDER_ID)
        document.getElementById(MODAL_MENU_ID).remove()
        finishCallback(currentNode(slider.value, possibleNodes))
    }

    return button
}

const createCancelButton = (cancelCallback, possibleNodes) => {
    const button = document.createElement('button')
    button.setAttribute('id', CANCEL_BUTTON_ID)
    button.innerHTML = "Cancel"

    button.onclick = _ => {
        possibleNodes.forEach(n => {
            n.style.display = ''
        })

        document.getElementById(MODAL_MENU_ID).remove()
        cancelCallback()
    }

    return button
}

const currentNode = (sliderValue, possibleNodes) => {
    const index = Math.floor(normalize(sliderValue, possibleNodes.length, 100))
    return possibleNodes.length > index ? possibleNodes[index] : null
}

const normalize = (value, x, y) => value * x / y;