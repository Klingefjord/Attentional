import regeneratorRuntime from "regenerator-runtime";

import React, {
  useState,
  useEffect
} from 'react'
import {
  FETCH_REMOVED,
  UNDO_REMOVED,
  SHOW_REMOVED,
  HIDE_REMOVED
} from '../../messages'

const RemoveFeaturesView = props => {
  const [removedFeaturesList, setRemovedFeaturesList] = useState([])

  useEffect(() => {
    const load = async () => {
      const removedFeatures = await fetchRemovedFeatures()
      setRemovedFeaturesList(removedFeatures)
    }

    load()
  })

  const getActiveTabId = async () => new Promise((resolve, reject) => {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      const error = chrome.runtime.lastError;
      if (error) reject(error)
      resolve(tabs[0].id)
    })
  })

  const fetchRemovedFeatures = async () =>
    getActiveTabId().then(tabId => new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, {
        action: FETCH_REMOVED
      }, response => {
        const error = chrome.runtime.lastError;
        if (error) reject(error)
        resolve(response)
      })
    }))

  const toggleFeature = async (featureKey, action) => getActiveTabId().then(tabId => new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, {
      action: action,
      key: featureKey
    }, response => {
      const error = chrome.runtime.lastError;
      if (error) reject(error)
      resolve(response)
    })
  }))

  const undoRemove = async featureKey => getActiveTabId()
    .then(tabId => new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, {
        action: UNDO_REMOVED,
        key: featureKey
      }, response => {
        const error = chrome.runtime.lastError;
        if (error) reject(error)
        resolve(response)
      })
    }))
    .then(fetchRemovedFeatures)
    .then(setRemovedFeaturesList)

  const renderRemovedFeature = removedFeature => {
    return <li 
      key={removedFeature} 
      onMouseEnter={_ => toggleFeature(removedFeature, SHOW_REMOVED)}
      onMouseLeave={_ => toggleFeature(removedFeature, HIDE_REMOVED)}
    >
      <h3>{removedFeature}</h3>
      <button onClick = {_ => undoRemove(removedFeature)}>Don't hide this feature</button>
    </li>
  }

  return (
    <div>
      <h1>RemoveFeaturesView</h1>
      <p>To remove a feature, right click on it and press "Hide this feature"</p>
      <p>Hidden features will be visible below. Hover over the name to view it.</p>
      <ul>{removedFeaturesList.map(renderRemovedFeature)}</ul>
    </div>
  )
}

export default RemoveFeaturesView