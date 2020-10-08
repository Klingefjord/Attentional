import React, {
  useState,
  useEffect
} from 'react'
import regeneratorRuntime from "regenerator-runtime";


const ShowHiddenContentView = props => {
  const [hiddenContent, setHiddenContent] = useState([])

  const getHiddenContent = () => new Promise((resolve, reject) => {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: FETCH_ACTIVE_ELEMENTS
      }, response => {
        const error = chrome.runtime.lastError;
        if (error) reject(error)
        resolve(response)
      })
    })
  })

  useEffect(() => {
    const load = async () => {
      const initialHiddenContent = await getHiddenContent()
      setHiddenContent(initialHiddenContent)
    }

    load()
  }, []);

  return (
    <div>
      <h1>Hidden content</h1>
    </div>
  )
}

export default ShowHiddenContentView