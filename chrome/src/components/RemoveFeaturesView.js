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

import RemovedFeatureRow from "./RemovedFeature";
import Separator from "./Separator";

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

  const toggleFeature = async (selectorPath, show) => {
    const action = show ? SHOW_REMOVED : HIDE_REMOVED

    return getActiveTabId().then(tabId => new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, {
      action: action,
      key: selectorPath
    }, response => {
      const error = chrome.runtime.lastError;
      if (error) reject(error)
      resolve(response)
    })
  }))
  }

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
      <h2 style={{marginBottom: '16px'}}>No hidden content for this page</h2>
      <p>To hide things, right-click anywhere on the site and click "hide".</p>
    </div>
  }

  const renderFromList = (list) => {
    const removedFeaturesRows = list.map((removedFeature, index) => 
        <RemovedFeatureRow
          includeSeparator={index !== list.length - 1}
          key={removedFeature.selectorPath}
          title={removedFeature.type}
          text={removedFeature.content}
          selectorPath={removedFeature.selectorPath}
          onActivate={() => toggleFeature(removedFeature.selectorPath, true)} 
          onDeactivate={() => toggleFeature(removedFeature.selectorPath, false)}
          onShowClicked={() => undoRemove(removedFeature.selectorPath)} />
      )

    return <ul>{removedFeaturesRows}</ul>
  }

  const renderLoading = () => {
      // empty for now
  }

  return (
    <div>
    {
      loading ? renderLoading() : removedFeaturesList.length === 0 ? renderEmpty() : renderFromList(removedFeaturesList)
    }
    </div>  
  )
}

export default RemoveFeaturesView