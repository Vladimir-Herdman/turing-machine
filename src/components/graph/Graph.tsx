import { type TapeState } from '../tape/Tape';

import styles from './Graph.module.css'

type Props = {
  state: TapeState;
};
export default function Graph({state}: Props) {
  console.log(state.machineDict);

  return (
    <div className={styles.graph}>
    </div>
  );
}
