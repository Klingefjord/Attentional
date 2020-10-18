import regeneratorRuntime from "regenerator-runtime";

import React, {
  useState,
  useEffect
} from 'react'

import {
  UPDATE_HIDDEN,
  FETCH_HIDDEN
} from '../../messages'

const ShowHiddenContentView = props => {
  const [hiddenContentList, setHiddenContentList] = useState([])

  const getHiddenContent = async () => new Promise((resolve, reject) => {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: FETCH_HIDDEN
      }, response => {
        const error = chrome.runtime.lastError;
        if (error) reject(error)
        resolve(response.hiddenContent)
      })
    })
  })

  const updateHiddenContent = (hiddenContent) => {
    const sendMessage = async () => new Promise((resolve, reject) => {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: UPDATE_HIDDEN,
          id: hiddenContent.id,
          hide: !hiddenContent.hidden
        }, response => {
          const error = chrome.runtime.lastError;
          if (error) reject(error)
          resolve(response)
        })
      })
    })

    const run = async () => {
      const success = await sendMessage()
      const updatedHiddenContent = await getHiddenContent()
      setHiddenContentList(updatedHiddenContent)
    }

    run()
  }

  const renderHiddenContent = hiddenContent => {
    return <li key={hiddenContent.id}>
      <h3>{hiddenContent.reason}</h3>
      <p>{hiddenContent.text}</p>
      <button onClick={e => updateHiddenContent(hiddenContent)}>{hiddenContent.hidden ? "Show" : "Hide"}</button>
    </li>
  }

  useEffect(() => {
    const load = async () => {
      const initialHiddenContent = await getHiddenContent()
      setHiddenContentList(initialHiddenContent)
    }

    load()
  }, [])

  return (
    <div>
      <h1>Hidden content</h1>
      <ul>{hiddenContentList.map(renderHiddenContent)}</ul>
    </div>
  )
}

export default ShowHiddenContentView