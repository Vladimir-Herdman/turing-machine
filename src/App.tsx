import { useRef, useState } from 'react'

import Codeblock from './components/codeblock/Codeblock'
import Graph from './components/graph/Graph'
import Tape from './components/tape/Tape'
import type { TapeState } from './components/tape/Tape'

import styles from './App.module.css'

import { codeExamples } from './constants/codeExamples'
import { inputLinePat, instructionPat } from './constants/regexPats'
import { decompress } from './utils/compression'

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

  const programText = getInitialProgram();

  return (
    <>
      <header>
        <h1>Turing Machine Simulator</h1>
      </header>

      <div className={styles.body}>
        <Tape state={tapeState} setState={setTapeState} />
        <div className={styles.visuals}>
          <div className={styles.graph}><Graph state={tapeState} /></div>
          <div className={styles.code}><Codeblock tapeState={tapeState} setTapeState={setTapeState} initialVal={programText} onChange={onCodeUpdate} /></div>
        </div>
      </div>

      <footer>
        <p>© 2026 Vladimir Herdman</p>
        <p>Website hosted through GitHub Pages at <a href="https://github.com/Vladimir-Herdman/turing-machine" target="_blank">this repository</a></p>
      </footer>
    </>
  );
}

function getInitialProgram() {
  const programCompressedText = new URLSearchParams(window.location.search).get("p");
  let program = "";
  if (programCompressedText)
    program = decompress(programCompressedText)
  else
    program = codeExamples[Object.keys(codeExamples)[0]];
  return program
}

export default App
