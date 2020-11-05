import {
    setTimeSpentOnSiteTodaySeconds,
    getTimeSpentOnSiteTodaySeconds
} from '../../chromeStorage'

import {
    TIMER_INTERVAL_MILLIS
} from '../../constants'

var timer;

(function () {
    if (timer) clearInterval(timer)
    timer = setInterval(updateCache, TIMER_INTERVAL_MILLIS)
})()

function updateCache() {
    if (!document.hidden) {
        const intervalSeconds = TIMER_INTERVAL_MILLIS / 1000
        const host = window.location.host
        getTimeSpentOnSiteTodaySeconds(host).then(time => {
            setTimeSpentOnSiteTodaySeconds(host, time + intervalSeconds)
        })
    }
}