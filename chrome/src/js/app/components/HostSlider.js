import React, {
    useState,
    useEffect
  } from 'react'
  import Slider from 'react-input-slider';
  import regeneratorRuntime from "regenerator-runtime";
  import {
    getTimeOnSiteAllowed
  } from '../../chromeStorage'
  
  const HostSlider = props => {
    const [seconds, setSeconds] = useState(0)
  
    useEffect(() => {
      const load = async () => {
        const seconds = await getTimeOnSiteAllowed(props.host)
        setSeconds(seconds)
      }
      load()
    }, []);

    useEffect(() => {
      props.onDragEnd(seconds)
    }, [seconds])

    return (
      <div>
        {props.host}&nbsp;&nbsp;&nbsp;
        <Slider axis="x" x={seconds} xmin={0} xmax={60 * 60} xstep={5 * 60} onChange={({ x }) => setSeconds(x)} />&nbsp;&nbsp;&nbsp;
        {`${Math.round(seconds / 60)} minutes`}
      </div>
    )
  }
  
  export default HostSlider