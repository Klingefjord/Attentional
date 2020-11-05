import React, {
    useState,
    useEffect
} from 'react'
import regeneratorRuntime from "regenerator-runtime";
import {
    getHosts as getHostsInStorage,
    setHosts as setHostsInStorage,
    setTimeOnSiteAllowed
} from '../../chromeStorage'
import HostSlider from './HostSlider';


const TimeOnSiteView = props => {
    const [hosts, setHosts] = useState([])

    useEffect(() => {
        const load = async () => {
            const hosts = await getHostsInStorage()
            setHosts(hosts)
        }
        load()
    }, []);

    const handleDragEnd = (host, seconds) => {
        setTimeOnSiteAllowed(host, seconds)
    }

    return (
        <div>
            <h1>Time on site limit</h1>
            <ul>{hosts.map(host => <li key={host}><HostSlider host={host} onDragEnd={seconds => handleDragEnd(host, seconds)} /></li>)}</ul>
        </div>
    )
}

export default TimeOnSiteView