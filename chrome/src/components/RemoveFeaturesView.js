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
} from '../messages'

const RemoveFeaturesView = props => {
  const [removedFeaturesList, setRemovedFeaturesList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const removedFeatures = await fetchRemovedFeatures()
      setRemovedFeaturesList(removedFeatures)
      setLoading(false)
    }

    load()
  }, [])

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

  const fetchRemovedFeatures = async () => {
    return getActiveTabId().then(tabId => new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, {
        action: FETCH_REMOVED
      }, response => {
        const error = chrome.runtime.lastError;
        if (error) reject(error)
        resolve(response)
      })
    }))
  }

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

  const undoRemove = async selectorPath => getActiveTabId()
    .then(tabId => new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, {
        action: UNDO_REMOVED,
        key: selectorPath
      }, response => {
        const error = chrome.runtime.lastError;
        if (error) reject(error)
        resolve(response)
      })
    }))
    .then(fetchRemovedFeatures)
    .then(setRemovedFeaturesList)

  const renderEmpty = () => {
    return <div>
      <h2>No hidden content for this page</h2>
      <h3>To hide things, right-click anywhere on the site and click "hide".</h3>
    </div>
  }

  const renderFromList = (list) => {
    return list.map(removedFeature => 
        <li 
          key={removedFeature.selectorPath} 
          onMouseEnter={_ => toggleFeature(removedFeature.selectorPath, SHOW_REMOVED)}
          onMouseLeave={_ => toggleFeature(removedFeature.selectorPath, HIDE_REMOVED)}
        >
          <h2>{removedFeature.type}</h2>
          <p>{removedFeature.content}</p>
          <button onClick = {_ => undoRemove(removedFeature.selectorPath)}>Show</button>
        </li>
      )
  }

  const renderLoading = () => {
      // empty for now
  }

  return (
    <div>
    {
      loading ? renderLoading() : removedFeaturesList.length === 0 ? renderEmpty() : <ul>{renderFromList(removedFeaturesList)}</ul>
    }
    </div>  
  )
}

export default RemoveFeaturesView