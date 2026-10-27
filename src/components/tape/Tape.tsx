import styles from './Tape.module.css'

type Props = {
  input: string;
};

export default function Tape({ input="" }: Props) {

  return (
    <>
      <div className={styles.tape}>
      {[...input].map((ch, i) => (
        <span
        key={i}
        className={styles.cell}>
        {ch}
        </span>
      ))}
      </div>
    </>
  );
}
