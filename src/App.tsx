import { useRef } from 'react'
import styles from './App.module.css'
import Codeblock from './components/codeblock/Codeblock'

function App() {
  const codeRef = useRef("");

  return (
    <>
      <h1>Hello, main page</h1>
      <p>This is an initial page test.</p>
      <div className={styles.code}><Codeblock onChange={(v) => (codeRef.current = v)} /></div>
    </>
  )
}

export default App
