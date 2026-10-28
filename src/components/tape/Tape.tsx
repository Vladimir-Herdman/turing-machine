import styles from './Tape.module.css'

export type TapeState = {
  input: string;
  headIndex: number;
  setHeadIndex: (index: number) => void;
}

type Props = {
  state: TapeState;
  setRunSpeed: (speed: number) => void;
};

export default function Tape({ state, setRunSpeed }: Props) {

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
        <button onClick={() => state.setHeadIndex(state.headIndex + 1)}>Step</button>
        <button>Run</button>
        <button onClick={() => state.setHeadIndex(0)}>Reset</button>
        <input type="range" min="1" max="100" onChange={(v) => setRunSpeed(Number(v.target.value))} />
      </div>
    </div>
  );
}
