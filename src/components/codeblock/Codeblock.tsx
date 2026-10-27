import { useRef, useState } from 'react'
import styles from './Codeblock.module.css'

type Props = {
  initialValue?: string;
  onChange: (value: string) => void;
};

export default function Codeblock({initialValue="", onChange}: Props) {
  const [code, setCode] = useState(initialValue);
  const gutterRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const update = (v: string) => {
    setCode(v);
    onChange(v);
  };

  const lineCount = code.split("\n").length;
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleScroll = (e: any) => {
    const { scrollTop, scrollLeft } = e.currentTarget;

    if (gutterRef.current)
      gutterRef.current.scrollTop = scrollTop;
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

  const coloredCode = code.slice();
  //now, go thorugh coloredCode and add the spans.

  return (
    <>
      <div className={styles.codeContainer}>
        <div className={styles.gutter} ref={gutterRef} aria-hidden="true">
          {lines.map((n) => (
            <div key={n}>{n}</div>
          ))}
        </div>

        <pre
          ref={preRef}
          aria-hidden={true}
          className={styles.divTest}
          style={{lineHeight:"var(--line-height)"}}>
          {coloredCode}
        </pre>
        <textarea
          className={styles.editable}
          value={code}
          onChange={(e) => update(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          wrap="off"
          rows={1}
          style={{lineHeight:"var(--line-height)"}}
        />
      </div>
    </>
  );
}

function insertAtCursor(e: any, state: any, setState: any, addition: string, cursorPos: number) {
  const { selectionStart: s, selectionEnd: end } = e.target;
  const next = state.slice(0, s) + addition + state.slice(end);
  setState(next);
  requestAnimationFrame(() => {
    e.target.selectionStart = e.target.selectionEnd = s + cursorPos;
  });
}
