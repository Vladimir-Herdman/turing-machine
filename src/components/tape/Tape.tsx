import type { Dispatch, SetStateAction } from 'react';
import styles from './Tape.module.css'

type MachineDict = Record<string, Record<string, StateMachine>>;
export type TapeState = {
  curState: string;
  machineDict: MachineDict;
  runSpeed: number;
  input: string;
  headIndex: number;
  code: React.RefObject<string>;
};

type StateMachine = {
  instructionline: number; //the original instruction line #, for highlighting reference while running.
  newSymbol: string;
  newState: string;
  direction: string;
};

type SetTapeState = Dispatch<SetStateAction<TapeState>>;
type Props = {
  state: TapeState;
  setState: SetTapeState;
};

export default function Tape({ state, setState}: Props) {

  return (
    <div className={styles.tape}>
      <div>
        {[...state.input].map((ch, i) => (
          <span
          key={i}
          className={`${styles.cell} ${i === state.headIndex ? styles.active : ""}`}>
          {ch}
          {i === state.headIndex && (<span className={styles.head}>^</span>)}
          </span>
        ))}
      </div>

      <div className={styles.controls}>
        <button onClick={() => loadCodeIntoStateMachine(state)}>Load Program</button>
        <button onClick={() => step(state, setState)}>Step</button>
        <button>Run</button>
        <button onClick={() => reset()}>Reset</button>
        <input type="range" min="1" max="100" onChange={(v) => setState(s => ({...s, runSpeed:Number(v.target.value)}))} />
      </div>
    </div>
  );
}

function isEmptyObj(o: any): Boolean {
  return Object.keys(o).length === 0;
}

function step(state: TapeState, setState: SetTapeState) {
  let machineDict: MachineDict = state.machineDict;
  let curState: string = state.curState;
  if (isEmptyObj(machineDict))
    [machineDict, curState] = loadCodeIntoStateMachine(state);
  if (isEmptyObj(machineDict) || curState === "") {
    console.error("TODO - error reason here.");
    return;
  }

  if (curState === "halt") {
    console.log("TODO - Insert halt/done logic here.");
    return;
  }

  const cursymbol = state.input[state.headIndex];
  const step = machineDict[curState][cursymbol];
  if (!step) {
    console.error(`No rule found for input '${cursymbol}' in state '${curState}'.`);
    return;
  }

  let {instructionline, newSymbol, newState, direction} = step;
  if (newSymbol === "_")
    newSymbol = " ";

  let newInput: string[], newHeadIndex: number=state.headIndex;
  console.log("TODO - use instructionline somewhere for highlighting:", instructionline)

  newInput = state.input.split("");
  newInput[state.headIndex] = newSymbol;

  if (direction === "r") {
    newHeadIndex += 1;
  } else if (direction === "l") {
    newHeadIndex -= 1;
  } else if (direction !== "*") {
    console.error("TODO - error here on wrong symbol?")
    return;
  }

  if (newHeadIndex >= newInput.length)
    newInput = [...newInput, " "];
  if (newHeadIndex <= state.headIndex && newHeadIndex <= 0) {
    newHeadIndex = 0;
    newInput = [" ", ...newInput];
  }

  setState(s => ({...s,
    input:newInput.join(""),
    headIndex:newHeadIndex,
    curState:newState,
    machineDict:machineDict,
  }));
}

function reset() {
  console.error("TODO - Make reset work properly.");
}

//In my head, this dict call will be take input one character at a time and the
//current state. Call the current state as string in the record to get the state
//machine, which will have another record in it for each input, like if you see
//a '0' or a '1'. so call dict[state][input-char], which gets <direction,
//replacement character, newstate>.
const instructionPat = /([a-zA-Z0-9_]+) ([a-zA-Z0-9_]) ([a-zA-Z0-9_]) ([lr\*]) ([a-zA-Z0-9_]+)/;
function loadCodeIntoStateMachine(state: TapeState): [machineDict: MachineDict, startState: string] {
  if (!state.code.current || state.code.current === "") {
    console.error("No code that can currently be loaded into state machine.");
    return [{}, ""];
  }

  const lines: string[] = state.code.current.split("\n");
  let stateMachineDict: Record<string, Record<string, StateMachine>> = {};
  let startState: string = "";

  for (let i=0; i<lines.length; i++) {
    const match = lines[i].match(instructionPat);
    if (!match)
      continue;
    let [, curstate, cursymbol, newsymbol, direction, newstate] = match;

    if (startState === "")
      startState = curstate;
    if (cursymbol === "_")
      cursymbol = " ";

    (stateMachineDict[curstate] ??= {})[cursymbol] = {
      instructionline: i+1,
      newSymbol: newsymbol,
      newState: newstate,
      direction: direction,
    };
  }

  return [stateMachineDict, startState];
}

