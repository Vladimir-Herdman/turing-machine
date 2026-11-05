import { useRef, useState } from 'react'
import styles from './App.module.css'
import Codeblock from './components/codeblock/Codeblock'
import { codeExamples } from './constants/codeExamples'
import Tape from './components/tape/Tape'
import type { TapeState } from './components/tape/Tape'
import { inputLinePat, instructionPat } from './constants/regexPats'

//TODO: Look into [SVG.js](https://svgjs.dev/docs/3.0/) for creating the graph
//and animating it with program execution.
function App() {
  const codeRef = useRef("");
  const [tapeState, setTapeState] = useState<TapeState>({
    runSpeed:50,
    run: false,
    input:codeExamples[Object.keys(codeExamples)[0]].match(inputLinePat)![1],
    headIndex:0,
    code:codeRef,
    machineDict: {},
    curState: "",
    showCurState: codeExamples[Object.keys(codeExamples)[0]].match(instructionPat)![1],
    curLine: -1,
    nextLine: -1,
    isCodeDisabled:false,
    stepCount:0,
  });

  const onCodeUpdate = (code: string, input: string) => {
    codeRef.current = code;
    let s = {...tapeState, input:input};
    setTapeState(s);
  };

  return (
    <>
      <header>
        <h1>Turing Machine Simulator</h1>
      </header>

      <div className={styles.body}>
        <Tape state={tapeState} setState={setTapeState} />
        <div className={styles.visuals}>
          <div className={styles.graph}></div>
          <div className={styles.code}><Codeblock tapeState={tapeState} setTapeState={setTapeState} onChange={onCodeUpdate} /></div>
        </div>
      </div>

      <footer>
        <p>© 2026 Vladimir Herdman</p>
        <p>Website statically hosted through GitHub Pages at <a href="https://github.com/Vladimir-Herdman/turing-machine" target="_blank">this repository</a></p>
      </footer>
    </>
  );
}

export default App
