import regeneratorRuntime from "regenerator-runtime"
import {
    getFeedReadIteration,
    getLabels,
    setFeedReadIteration,
    setPendingExtraction,
    getSequencesPendingExtraction,
    setSequencesPendingExtraction
} from "../../chromeStorage";
import {
    textForClassification
} from "../classifier/utils";

import {
    EXTRACTOR_SCROLL_COUNT as SCROLL_COUNT,
    FEED_READ_COUNT
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
    const sequences = [...nodes].map(textForClassification)

    const getAccumulatedSequences = () => getSequencesPendingExtraction(host).then(oldSequences => {
        return [...new Set([...oldSequences, ...sequences])]
    })
    const updateAccumulatedSequences = () => getAccumulatedSequences().then(sequences => setSequencesPendingExtraction(host, sequences))

    getFeedReadIteration(host).then(feedReadIteration => {
        if (feedReadIteration < FEED_READ_COUNT) {
            alert("Feed read iteration is " + feedReadIteration + ". I'm reloading")
            setFeedReadIteration(host, ++feedReadIteration)
                .then(() => setPendingExtraction(host, true))
                .then(() => updateAccumulatedSequences())
                .then(() => window.location.reload())
        } else {
            alert("Feed read iteration is " + feedReadIteration + ". I'm finished and sending request")
            setFeedReadIteration(host, 0)
                .then(() => setPendingExtraction(host, false))
                .then(() => getAccumulatedSequences())
                .then(accumulatedSequences => sendRequest(host, accumulatedSequences))
                .then(() => setSequencesPendingExtraction(host, []))
                .then(() => window.close())
        }
    })
}

async function sendRequest(host, sequences) {
    const labels = await getLabels()
    return fetch(`${BASE_URL}/classify`, {
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
}