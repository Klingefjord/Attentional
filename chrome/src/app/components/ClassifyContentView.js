import React, { useState, useEffect } from 'react'
import { 
  getLabels as getLabelsFromStorage, 
  setLabels as setLabelsInStorage, 
  clear as clearStorage 
} from '../chromeStorage'
import {
  CACHE_UPDATE
} from "../messages";


const ClassifyContentView = props => {
  const [labels, setLabels] = useState([])
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    getLabelsFromStorage().then(setLabels)
  }, []);

  const removeLabel = label => {
    const copy = [...labels]
    copy.splice(copy.indexOf(label), 1)
    updateLabels(copy)
  }

  const handleFormSubmit = e => {
    e.preventDefault()
    const copy = [...labels]
    copy.push(inputValue)
    updateLabels(copy)
    setInputValue("")
  }

  const updateLabels = newLabels => {
    const notifyCacheUpdate = () => {
      chrome.tabs.query({
          active: true,
          currentWindow: true
      }, tabs => {
          chrome.tabs.sendMessage(tabs[0].id, {
              action: CACHE_UPDATE
          }, response => {}
          )})
    }

    setLabels(newLabels)
    setLabelsInStorage(newLabels).then(notifyCacheUpdate)
  }

  const runClassifier = _ => {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs =>
    chrome.tabs.executeScript(tabs[0].id, {
      file: 'classifier.bundle.js'
    }))
  }

  return (
    <div>
      <h1>Classify Content</h1>
      <ul>{labels.map(label => <li key={label}>{label} <button onClick={_ => removeLabel(label)}>remove</button></li>)}</ul>
      <form onSubmit={handleFormSubmit}>
        <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} />
        <input type="submit" value="Add Label" />
      </form>
      <button onClick={runClassifier}>Run classifier</button>
      <button onClick={e => clearStorage().then(() => updateLabels([]))}>Clear storage</button>
    </div>
  )
}

export default ClassifyContentView