import { useRef, useState } from 'react'
import { initialCodeExample } from './examples-strings';
import styles from './Codeblock.module.css'

type Props = {
  initialVal?: string;
  onChange: (value: string) => void;
};

export default function Codeblock({initialVal=initialCodeExample, onChange}: Props) {
  const [code, setCode] = useState(initialVal);
  const [caret, setCaret] = useState(initialVal.length); // offset into the string
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const update = (val: string, newCaret: number) => {
    setCode(val);
    setCaret(newCaret);
    onChange(val);
  };

  const syncCaret = (e: React.SyntheticEvent<HTMLTextAreaElement>) => setCaret(e.currentTarget.selectionStart);

  const handleScroll = (e: any) => {
    const { scrollTop, scrollLeft } = e.currentTarget;

    if (lineNumbersRef.current)
      lineNumbersRef.current.scrollTop = scrollTop;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Tab") {
      e.preventDefault();
      insertAtCursor(e, code, update, "  ", 2);
    }
  };

  const commentPat = /(\/\/.*)/;
  const coloredCode: string[] = code.split(commentPat);

  const beforeCaret = code.slice(0, caret).split("\n");
  const cursorRow = beforeCaret.length;
  const cursorCol = beforeCaret[beforeCaret.length - 1].length+1;

  return (
    <div className={styles.code}>
      <div className={styles.lineNumbers} ref={lineNumbersRef}>
        {code.split("\n").map((_, i) => ( <div key={i+1}>{i+1}</div> ))}
      </div>
      <div className={styles.infoBox}>{cursorRow}, {cursorCol}</div>

      <pre
        ref={preRef}
        className={styles.overlayText}
        spellCheck={false}
        style={{lineHeight:"var(--line-height)"}}>
        {coloredCode.map((text, i) => (
          <span key={i} className={text.match(commentPat) ? styles.comment : styles.plain}>{text}</span>
        ))}
      </pre>
      <textarea
        className={styles.editable}
        value={code}
        onChange={(e) => update(e.target.value, e.target.selectionStart)}
        onSelect={syncCaret}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        wrap="off"
        style={{lineHeight:"var(--line-height)"}}
      />
    </div>
  );
}

function insertAtCursor(e: any, state: any, setState: any, addition: string, cursorPos: number) {
  const { selectionStart: s, selectionEnd: end } = e.target;
  const next = state.slice(0, s) + addition + state.slice(end);
  setState(next);
  e.target.selectionStart = e.target.selectionEnd = s + cursorPos;
}
