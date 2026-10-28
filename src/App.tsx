import { useRef, useState } from 'react'
import styles from './App.module.css'
import Codeblock from './components/codeblock/Codeblock'
import { initialCodeExample } from './components/codeblock/examples-strings'
import Tape from './components/tape/Tape'
import type { TapeState } from './components/tape/Tape'

//TODO: Look into [SVG.js](https://svgjs.dev/docs/3.0/) for creating the graph
//and animating it with program execution.
function App() {
  const [input, setInput] = useState(initialCodeExample.match(/[10]+/)![0])
  const [tapeIndex, setTapeIndex] = useState(0)
  const [runSpeed, setRunSpeed] = useState(50);
  const codeRef = useRef("");

  const onCodeUpdate = (code: string, input: string) => {
    codeRef.current = code;
    setInput(input);
  };

  const tapeState: TapeState = {input:input, headIndex:tapeIndex, setHeadIndex:setTapeIndex};
  console.log(tapeState);

  return (
    <>
      <header>
        <h1>Turing Machine</h1>
      </header>
      <div className={styles.body}>
        <Tape state={tapeState} setRunSpeed={setRunSpeed} />
        <div className={styles.visuals}>
          <div className={styles.graph}></div>
          {/*<div className={styles.slider}></div>*/}
          <div className={styles.code}><Codeblock onChange={onCodeUpdate} /></div>
        </div>
      </div>
    </>
  );
}

export default App
