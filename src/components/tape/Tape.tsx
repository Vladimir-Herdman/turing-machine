import type { Dispatch, SetStateAction } from 'react';
import styles from './Tape.module.css'

export type TapeState = {
  curState?: string;
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
type MachineDict = Record<string, Record<string, StateMachine>>;

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
          className={styles.cell}>
          {ch}
          {i === state.headIndex && (<span className={styles.head}>^</span>)}
          </span>
        ))}
      </div>

      <div className={styles.controls}>
        <button onClick={() => loadCodeIntoStateMachine(state, setState)}>Load Program</button>
        <button onClick={() => step(state, setState)}>Step</button>
        <button>Run</button>
        <button onClick={() => console.log("TODO - set Reset button method.")}>Reset</button>
        <input type="range" min="1" max="100" onChange={(v) => setState(s => ({...s, runSpeed:Number(v.target.value)}))} />
      </div>
    </div>
  );
}

function step(state: TapeState, setState: SetTapeState) {
  const [stateMachineDict, startState] = loadCodeIntoStateMachine(state);
  //TODO: Check if {} is falsy here?
  if (!stateMachineDict || !startState) {
    console.error("TODO - do something here, like throw an error? Input not in state list?");
    return
  }

  const cursymbol = state.input[state.headIndex];
  const step = stateMachineDict[startState][cursymbol];
  if (!step) {
    console.error("TODO - do something here, like throw an error? Input not in state list?");
  }

  const {instructionline, newSymbol, newState, direction} = step;
  let newInput: string[], newHeadIndex: number=state.headIndex;

  newInput = state.input.split("");
  newInput[state.headIndex] = "a";

  if (direction === "r") {
    newHeadIndex += 1;
  } else if (direction === "l") {
    newHeadIndex -= 1;
  } else if (direction !== "*") {
    console.error("TODO - error here on wrong symbol?")
    return;
  }

  console.log("curstate", startState)
  setState(s => ({...s,
    input:newInput.join(""),
    headIndex:newHeadIndex,
    curState:newState,
  }));
}

//In my head, this dict call will be take input one character at a time and the
//current state. Call the current state as string in the record to get the state
//machine, which will have another record in it for each input, like if you see
//a '0' or a '1'. so call dict[state][input-char], which gets <direction,
//replacement character, newstate>.
const instructionPat = /([a-zA-Z0-9_]+) ([a-zA-Z0-9_]) ([a-zA-Z0-9_]) ([lr\*]) ([a-zA-Z0-9_]+)/;
function loadCodeIntoStateMachine(state: TapeState): [machineDict: MachineDict, startState: string | undefined] {
  if (!state.code.current || state.code.current === "") {
    console.error("No code that can currently be loaded into state machine.");
    return [{}, undefined];
  }

  const lines: string[] = state.code.current.split("\n");
  let stateMachineDict: Record<string, Record<string, StateMachine>> = {};
  let startState: string | undefined;

  for (let i=0; i<lines.length; i++) {
    const match = lines[i].match(instructionPat);
    if (!match)
      continue;
    const [, curstate, cursymbol, newsymbol, direction, newstate] = match;

    startState ??= curstate;
    (stateMachineDict[curstate] ??= {})[cursymbol] = {
      instructionline: i+1,
      newSymbol: newsymbol,
      newState: newstate,
      direction: direction,
    };
  }

  return [stateMachineDict, startState];
}

