import { useEffect, useRef, useState } from 'react'
import { initialCodeExample } from './examples-strings';
import styles from './Codeblock.module.css'

type Props = {
  initialVal?: string;
  onChange: (codeText: string, input: string) => void;
};

const commentPat = /(\/\/.*)/;
const inputPat = /input:[ ]*([01]+)/;
const errorPat = /(.+ .+ .+ [lr\*] .+)|([a-z]+:[ ]*[a-z0-1]+)/
let errorCount = 0;

export default function Codeblock({initialVal=initialCodeExample, onChange}: Props) {
  const [code, setCode] = useState(initialVal);
  const [caret, setCaret] = useState(initialVal.length); // offset into the string
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const update = (val: string, newCaret?: number) => {
    setCode(val);
    if (newCaret)
      setCaret(newCaret);
    const input = val.match(inputPat) ?? ["", ""];
    onChange(val, input[1]);
  };

  //Called once at startup/load, since empty dependency array.
  useEffect(() => {
    update(initialCodeExample);
  }, []);

  const syncCaret = (e: React.SyntheticEvent<HTMLTextAreaElement>) =>
    setCaret(e.currentTarget.selectionStart);

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

  const coloredCode: any = splitByTokens(code);

  const beforeCaret = code.slice(0, caret).split("\n");
  const cursorRow = beforeCaret.length;
  const cursorCol = beforeCaret[beforeCaret.length - 1].length+1;

  return (
    <div className={styles.code}>
      <div className={styles.lineNumbers} ref={lineNumbersRef}>
        {getLineNumbers(code)}
      </div>
      <div className={styles.infoBox}>errors:{errorCount}, row:{cursorRow}, col:{cursorCol}</div>

      <pre
        ref={preRef}
        className={styles.overlayText}
        spellCheck={false}
        style={{lineHeight:"var(--line-height)"}}>
        {coloredCode.map((token: Token, i: number) => (
          <span
            key={i}
            className={getTextSpanColor(token.token)}>
            {token.text}
          </span>
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

type Token = {
  text: string;
  token: string;
};
function splitByTokens(text: string) {
  let tokens: Token[] = [];

  let lines = text.split("\n");
  let inputSet = false;
  for (let i=0; i<lines.length; i++){
    let [plain, comment] = lines[i].split(/(\/\/.*)/);

    if (plain) {
      if (!inputSet && plain.match(inputPat)) {
        const [a, b, c] = plain.split(/([10]+)/);
        tokens.push({text: a, token: "plain"});
        tokens.push({text: b, token: "input"});
        tokens.push({text: c, token: "plain"});
        inputSet = true;
      } else {
        tokens.push({text: plain, token: "plain"});
      }
    }
    if (comment)
      tokens.push({text: comment, token: "comment"});

    tokens.push({text: "\n", token: "plain"})
  }

  return tokens;
}

function getTextSpanColor(text: string) {
  let className = styles.plain;

  switch (text) {
    case "comment":
      className=styles.comment;
      break;
    case "input":
      className=styles.input;
      break;
  }

  return className;
}

function getLineNumbers(codeText: string) {
  let lines = codeText.split("\n");
  errorCount = 0;
  return lines.map((text, i) => {
    text = text.split(commentPat)[0].trim();

    let error = false;
    if (!text.match(errorPat))
      error = true;

    if (text.length === 0)
      error = false;

    if (error)
      errorCount += 1;
    return (<div className={error ? styles.red : ""} key={i+1}>{i+1}</div>);
  });
}
