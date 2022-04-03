import React, {
  useState
} from 'react'

import Separator from './Separator'

const RemovedFeatureRow = props => {
  const { 
    includeSeparator,
    title, 
    text, 
    selectorPath,
    temporarilyShown,
    onActivate, 
    onDeactivate, 
    onRowClicked,
    onShowClicked 
  } = props

  const [active, setActive] = useState(temporarilyShown)

  const activate = () => {
    if (temporarilyShown) {
      return
    }

    setActive(true)
    onActivate()
  }

  const deactivate = () => {
    if (temporarilyShown) {
      return
    }

    setActive(false)
    onDeactivate()
  }
  
  return (
    <li>
      <div className={`RemovedFeaturesRow`} onMouseEnter={_ => activate()} onMouseLeave={_ => deactivate()}>
        <div style={{margin: "0 16px 0 0"}} onClick= {_ => {
          console.log("bar")
          onRowClicked()
        }}>
          <h2 className={active ? '' : 'disabled-header'} >{title}</h2>
          <p className={active ? 'active-text' : 'disabled-text'}>{text}</p>
        </div>
        <button disabled={!active} className={'show-button'} onClick = {_ => {
          console.log("foo")
          onShowClicked()
        }
          }>Show</button>
      </div>
      {includeSeparator && <Separator />}
    </li>
  )
}

export default RemovedFeatureRow