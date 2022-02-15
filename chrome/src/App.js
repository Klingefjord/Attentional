import React from 'react'
import onClickOutside from 'react-onclickoutside'
import RemoveFeaturesView from "./components/RemoveFeaturesView";

import { SIDEBAR_CONTENT_SCRIPT } from './constants'


const App = props => {
  App.handleClickOutside = () => {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      chrome.scripting.executeScript(tabs[0].id, {
        file: SIDEBAR_CONTENT_SCRIPT
      })
    })
  }

  return (
    <div className={'App'}>
      <RemoveFeaturesView />
    </div>
  )
}

export default onClickOutside(App, {handleClickOutside: () => App.handleClickOutside})
