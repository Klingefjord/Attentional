import React, {
  useState,
  useEffect
} from 'react'
import regeneratorRuntime from "regenerator-runtime";
import {
  getLabels as getLabelsInStorage,
  setLabels as setLabelsInStorage,
  getHosts as getHostsInStorage,
  setHosts as setHostsInStorage,
  clear as clearStorage
} from '../../chromeStorage'
import { CLASSIFIER_ID } from '../../constants'
import {
  LABEL_UPDATE,
  HOST_UPDATE
} from "../../messages";


const ClassifyContentView = props => {
  const [labels, setLabels] = useState([])
  const [hosts, setHosts] = useState([])
  const [labelInputValue, setLabelInputValue] = useState("")
  const [hostInputValue, setHostInputValue] = useState("")

  useEffect(() => {
    const load = async () => {
      const labelsFromStorage = await getLabelsInStorage()
      const hostsFromStorage = await getHostsInStorage()
      setLabels(labelsFromStorage)
      setHosts(hostsFromStorage)
    }
    load()
  }, []);

  const removeLabel = label => {
    const copy = [...labels]
    copy.splice(copy.indexOf(label), 1)
    updateLabels(copy)
  }

  const removeHost = host => {
    const copy = [...hosts]
    copy.splice(copy.indexOf(host), 1)
    updateHosts(copy)
  }

  const handleLabelFormSubmit = e => {
    e.preventDefault()
    const copy = [...labels]
    const label = labelInputValue
    if (!copy.includes(label)) copy.push(label)
    updateLabels(copy)
    setLabelInputValue("")
  }

  const handleHostFormSubmit = e => {
    e.preventDefault()
    const copy = [...hosts]
    const host = hostInputValue
    if (!copy.includes(host)) hosts.push(host)
    updateHosts(copy)
    setHostInputValue("")
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

  const updateHosts = newHosts => {
    setHosts(newHosts)

    const notifyListeners = () => {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: HOST_UPDATE,
          hosts: newHosts
        }, response => {
          return true
        })
      })
    }

    setHostsInStorage(newHosts).then(notifyListeners)
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
      <form onSubmit={e => handleLabelFormSubmit(e)}>
        <input type="text" value={labelInputValue} onChange={e => setLabelInputValue(e.target.value)} />
        <input disabled={!/[A-Za-z]+/.test(labelInputValue)} type="submit" value="Add Label" />
      </form>
      <br></br>
      <ul>{hosts.map(host => <li key={host}>{host} <button onClick={_ => removeHost(label)}>remove</button></li>)}</ul>
      <form onSubmit={e => handleHostFormSubmit(e)}>
        <input type="text" value={hostInputValue} onChange={e => setHostInputValue(e.target.value)} />
        <input disabled={!/[A-Za-z]+/.test(hostInputValue)} type="submit" value="Add a website" />
      </form>
      <button onClick={_ => runClassifier()}>Run classifier</button>
      <button onClick={_ => clearStorage().then(() => updateLabels([]))}>Clear storage</button>
    </div>
  )
}

export default ClassifyContentView