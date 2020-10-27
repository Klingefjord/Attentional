import regeneratorRuntime from "regenerator-runtime"
import { BASE_URL } from "../../../utils/env";

import {
    getHosts,
    getLabels
} from '../chromeStorage'

import {
    POLLING_INTERVAL
} from '../constants';

var poller;

export const restartPoller = () => {
    if (poller) clearInterval(poller)
    poll()
    poller = setInterval(poll, POLLING_INTERVAL)
}

const poll = async () => {
    const labels = await getLabels()
    const hosts = await getHosts()

    console.log("Time to poll! Labels", labels, " hosts ", hosts)

    if (labels.length === 0 || hosts.length === 0) return

    for (const host of hosts) {
        sendRequest(host, labels).then(_ => console.log(`Got response from classifier for host ${host}`))
    }
}

const sendRequest = (host, labels) =>
    fetch(`${BASE_URL}/parse`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            "host": host,
            "labels": labels
        })
    }).then(response => response.json())
    .catch(err => console.error(err))