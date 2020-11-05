const { setTimeSpendOnSiteTodaySeconds, getTimeSpentOnSiteTodaySeconds } = require("../../chromeStorage");

import {
    TIMER_INTERVAL_MILLIS
} from '../../constants'

var timer;

(function() {
    if (timer) clearInterval(timer)
    timer = setInterval(updateCache, TIMER_INTERVAL_MILLIS)
})()

function updateCache() {
    if (!document.hidden) {
        const intervalSeconds = TIMER_INTERVAL_MILLIS / 1000
        getTimeSpentOnSiteTodaySeconds(window.host).then(time => setTimeSpendOnSiteTodaySeconds(time + intervalSeconds))
    } else {
        console.log("Not updating timer, document is hidden")
    }
}