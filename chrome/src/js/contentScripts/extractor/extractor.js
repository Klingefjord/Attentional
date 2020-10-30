import regeneratorRuntime from "regenerator-runtime"
import {
    getLabels,
    setPendingExtraction
} from "../../chromeStorage";
import {
    textForClassification
} from "../classifier/utils";

import {
    EXTRACTOR_SCROLL_COUNT as SCROLL_COUNT
} from "../../constants"

import {
    spinner
} from './spinner'
import {
    BASE_URL
} from "../../../../utils/env";

var nodes = new Set()
var scroller;

(function () {
    console.log("Running extractor")
    const body = document.getElementsByTagName('body')[0]
    body.insertBefore(spinner(window.location.host), body.firstChild)
    let scrollIteration = 0
    scroller = setInterval(() => {
        if (++scrollIteration > SCROLL_COUNT) {
            finish()
        } else {
            scroll()
            extract()
        }
    }, 2000)
    extract()
})()

function extract() {
    [...document.getElementsByTagName('article')].forEach(n => nodes.add(n))
}

function scroll() {
    const scrollingElement = (document.scrollingElement || document.body)
    scrollingElement.scrollTop = scrollingElement.scrollHeight
}

async function finish() {
    clearInterval(scroller)

    const host = window.location.host
    const labels = await getLabels()
    const sequences = [...nodes].map(textForClassification)

    const sendRequest = (host, labels) =>
        fetch(`${BASE_URL}/classify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                "host": host,
                "labels": labels,
                "sequences": sequences
            })
        }).then(response => response.json())
        .catch(err => console.error(err))

    window.close()
    await sendRequest(host, labels)
}