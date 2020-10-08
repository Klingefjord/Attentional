import React, { useState, useEffect } from 'react'
import { getLabels, setLabels } from '../chromeStorage'

const ClassifyContentView = props => {
  const [labels, setLabelsState] = useState([])
  const [inputValue, setInputValue] = useState("")

  useEffect(() => getLabels().then(labelsFromStorage => setLabelsState(labelsFromStorage)), []);

  const removeLabel = label => {
    const copy = [...labels]
    copy.splice(copy.indexOf(label), 1)
    setLabelsState(copy)
    setLabels(copy)
  }

  const handleFormSubmit = e => {
    e.preventDefault()
        const copy = [...labels]
        copy.push(inputValue)
        setInputValue("")
        setLabelsState(copy)
        setLabels(copy)
  }

  return (
    <div>
      <h1>Classify Content</h1>
      <ul>{labels.map(label => <li key={label}>{label} <button onClick={e => removeLabel(label)}>remove</button></li>)}</ul>
      <form onSubmit={handleFormSubmit}>
        <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} />
        <input type="submit" value="Add Label" />
      </form>
      <button>Extract text content</button>
      <button>Show hidden</button>
    </div>
  )
}

export default ClassifyContentView