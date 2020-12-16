import React, {
  useState
} from 'react'

import Separator from './Separator'

const RemovedFeatureRow = props => {
  const [active, setActive] = useState(false)

  const { 
    includeSeparator,
    title, 
    text, 
    selectorPath,
    onActivate, 
    onDeactivate, 
    onShowClicked 
  } = props

  const activate = () => {
    setActive(true)
    onActivate()
  }

  const deactivate = () => {
    setActive(false)
    onDeactivate()
  }

  return (
    <li>
      <div className={"RemovedFeaturesRow"} onMouseEnter={_ => activate()} onMouseLeave={_ => deactivate()}>
        <div style={{margin: "0 16px 0 0"}}>
          <h2 className={active ? '' : 'disabled-header'} >{title}</h2>
          <p className={active ? 'active-text' : 'disabled-text'}>{text}</p>
        </div>
        <button disabled={!active} className={'show-button'} onClick = {_ => onShowClicked()}>Show</button>
      </div>
      {includeSeparator && <Separator />}
    </li>
  )
}

export default RemovedFeatureRow