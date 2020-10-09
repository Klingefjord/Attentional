import React, {
  useState,
  useEffect
} from 'react'
import regeneratorRuntime from "regenerator-runtime";
import {
  getLabels as getLabelsFromStorage,
  setLabels as setLabelsInStorage,
  clear as clearStorage
} from '../../chromeStorage'
import { CLASSIFIER_ID } from '../../constants'
import {
  LABEL_UPDATE
} from "../../messages";


const ClassifyContentView = props => {
  const [labels, setLabels] = useState([])
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    const load = async () => {
      const labelsFromStorage = await getLabelsFromStorage()
      setLabels(labelsFromStorage)
    }
    load()
  }, []);

  const removeLabel = label => {
    const copy = [...labels]
    copy.splice(copy.indexOf(label), 1)
    updateLabels(copy)
  }

  const handleFormSubmit = e => {
    e.preventDefault()
    const copy = [...labels]
    const label = inputValue
    if (!copy.includes(label)) copy.push(label)
    updateLabels(copy)
    setInputValue("")
  }

  const updateLabels = newLabels => {
    setLabels(newLabels)

    const notifyListeners = () => {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: LABEL_UPDATE,
          labels: newLabels
        }, response => {
          return true
        })
      })
    }

    setLabelsInStorage(newLabels).then(notifyListeners)
  }

  const runClassifier = _ => {
    chrome.tabs.query({
        active: true,
        currentWindow: true
      }, tabs =>
      chrome.tabs.executeScript(tabs[0].id, {
        file: CLASSIFIER_ID
      }))
  }

  return (
    <div>
      <h1>Classify Content</h1>
      <ul>{labels.map(label => <li key={label}>{label} <button onClick={_ => removeLabel(label)}>remove</button></li>)}</ul>
      <form onSubmit={e => handleFormSubmit(e)}>
        <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} />
        <input disabled={!/[A-Za-z]+/.test(inputValue)} type="submit" value="Add Label" />
      </form>
      <button onClick={_ => runClassifier()}>Run classifier</button>
      <button onClick={_ => clearStorage().then(() => updateLabels([]))}>Clear storage</button>
    </div>
  )
}

export default ClassifyContentView