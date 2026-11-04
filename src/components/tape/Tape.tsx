import { useEffect, type Dispatch, type SetStateAction } from 'react';
import styles from './Tape.module.css'

type MachineDict = Record<string, Record<string, StateMachine>>;
export type TapeState = {
  curState: string;
  showCurState: string;
  curLine: number;
  nextLine: number;
  machineDict: MachineDict;
  runSpeed: number;
  run: boolean;
  input: string;
  headIndex: number;
  code: React.RefObject<string>;
  isCodeDisabled: boolean;
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

const haltPat = /.*(halt|accept|reject).*/i;

export default function Tape({ state, setState}: Props) {

  useEffect(() => {
    if (!state.run && !state.curState.match(haltPat))
      return;

    const id = setTimeout(() => {
      step(state, setState);
    }, Math.max(Math.abs(state.runSpeed-100)*10, 1));

    return () => clearTimeout(id);
  }, [state]);

  let input = [...state.input];
  if (input.length === 0)
    input = [" "];

  return (
    <div className={styles.tape}>
      <div>
        {input.map((ch, i) => (
          <span
          key={i}
          className={`${styles.cell} ${i === state.headIndex ? styles.active : ""}`}>
          {ch}
          {i === state.headIndex && (<span className={styles.head}>^</span>)}
          </span>
        ))}
      </div>

      <div className={styles.stateInfo}>
        <div>Current State: <span>{state.showCurState}</span></div>
        <div>Current Speed: <span>instruction/{Math.max(Math.abs(state.runSpeed-100)*10, 1)}ms</span></div>
      </div>

      <div className={styles.controls}>
        <button onClick={() => {!state.run && step(state, setState)}}>Step</button>
        {!state.run
          ? <button onClick={() => run(state, setState)}>Run</button>
          : <button onClick={() => pause(state, setState)}>Pause</button>
        }
        <button onClick={() => reset(state, setState)}>Reset</button>
        <input type="range" min="0" max="100" onChange={(v) => setState(s => ({...s, runSpeed:Number(v.target.value)}))} />
      </div>
    </div>
  );
}

function isEmptyObj(o: any): boolean {
  return Object.keys(o).length === 0;
}

function step(state: TapeState, setState: SetTapeState, updateState=true): TapeState { //false if stop execution.
  let machineDict: MachineDict = state.machineDict;
  let curState: string = state.curState;
  if (isEmptyObj(machineDict))
    [machineDict, curState] = loadCodeIntoStateMachine(state);

  if (curState.match(haltPat))
    return {} as TapeState;

  const cursymbol = state.input[state.headIndex];
  const curstep = machineDict[curState][cursymbol];
  if (!curstep) {
    console.error(`No rule found for input '${cursymbol}' in state '${curState}'.`);
    return {} as TapeState;
  }

  let {instructionline, newSymbol, newState, direction} = curstep;
  if (newSymbol === "_")
    newSymbol = " ";

  let newInput: string[], newHeadIndex: number=state.headIndex;

  newInput = state.input.split("");
  newInput[state.headIndex] = newSymbol;

  if (direction === "r") {
    newHeadIndex += 1;
  } else if (direction === "l") {
    newHeadIndex -= 1;
  } else if (direction !== "*") {
    console.error(`ERROR: Only directions are 'l', 'r', and '*', but a rule used '${direction}'.`);
    return {} as TapeState;
  }

  if (newHeadIndex >= newInput.length)
    newInput = [...newInput, " "];
  if (newHeadIndex < 0) {
    newHeadIndex = 0;
    newInput = [" ", ...newInput];
  }

  let newTapeState = {...state,
    input:newInput.join(""),
    headIndex:newHeadIndex,
    curState:newState,
    ShowCurState:newState,
    machineDict:machineDict,
    curLine:instructionline-1,
    isCodeDisabled:true,
  }

  if (updateState) {
    const nextTapeState = step(newTapeState, setState, false);
    newTapeState.nextLine = nextTapeState.curLine;
    if (nextTapeState.curLine != undefined)
      newTapeState.showCurState = nextTapeState.curState;
    setState(newTapeState);
  }

  return newTapeState;
}

function run(state: TapeState, setState: SetTapeState) {
  setState({...state, run:true, isCodeDisabled:true});
}

function pause(state: TapeState, setState: SetTapeState) {
  setState({...state, run:false});
}

function reset(state: TapeState, setState: SetTapeState) {
  let input: RegExpMatchArray | null = state.code.current.match(/input:[ ]*([a-zA-Z0-9-]+)/);
  input ??= ["  ", "  "];
  let showCurState: RegExpMatchArray | null = state.code.current.match(/([a-zA-Z0-9_]+) ([a-zA-Z0-9_]) ([a-zA-Z0-9_]) ([lr\*]) ([a-zA-Z0-9_]+)/);
  showCurState ??= ["", ""];

  setState({...state,
    run:false,
    input:input[1],
    headIndex:0,
    machineDict:{},
    curState:"",
    showCurState: showCurState[1],
    curLine:-1,
    nextLine:-1,
    isCodeDisabled:false,
  })
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

