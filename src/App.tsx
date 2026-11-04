import { useRef, useState } from 'react'
import styles from './App.module.css'
import Codeblock from './components/codeblock/Codeblock'
import { codeExamples } from './components/codeblock/examples-strings'
import Tape from './components/tape/Tape'
import type { TapeState } from './components/tape/Tape'

//TODO: Look into [SVG.js](https://svgjs.dev/docs/3.0/) for creating the graph
//and animating it with program execution.
function App() {
  const codeRef = useRef("");
  const [tapeState, setTapeState] = useState<TapeState>({
    runSpeed:50,
    run: false,
    input:codeExamples[Object.keys(codeExamples)[0]].match(/input:[ ]*([01]+)/)![1],
    headIndex:0,
    code:codeRef,
    machineDict: {},
    curState: "",
    curLine: -1,
    nextLine: -1,
    isCodeDisabled:false,
  });

  const onCodeUpdate = (code: string, input: string) => {
    codeRef.current = code;
    setTapeState(s => ({...s, input:input}));
  };

  return (
    <>
      <header>
        <h1>Turing Machine</h1>
      </header>
      <div className={styles.body}>
        <Tape state={tapeState} setState={setTapeState} />
        <div className={styles.visuals}>
          <div className={styles.graph}></div>
          <div className={styles.code}><Codeblock tapeState={tapeState} onChange={onCodeUpdate} /></div>
        </div>
      </div>
    </>
  );
}

export default App
