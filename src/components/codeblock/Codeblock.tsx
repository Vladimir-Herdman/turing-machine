import { useEffect, useRef, useState } from 'react'
import { codeExamples } from 'src/constants/codeExamples';
import styles from './Codeblock.module.css'
import { type TapeState } from 'src/components/tape/Tape';
import { commentPat, inputLinePat, errorPat, inputPat } from 'src/constants/regexPats';

type Props = {
  tapeState: TapeState;
  initialVal?: string;
  onChange: (codeText: string, input: string, clean: boolean) => void;
};

let errorCount = 0;

export default function Codeblock({tapeState, initialVal=codeExamples[Object.keys(codeExamples)[0]], onChange}: Props) {
  const [code, setCode] = useState(initialVal);
  const [caret, setCaret] = useState(initialVal.length); // offset into the string
  const [curScrollTop, setCurScrollTop] = useState(0);
  const [nextScrollTop, setNextScrollTop] = useState(0);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const update = (val: string, newCaret?: number, clean: boolean=false) => {
    setCode(val);
    if (newCaret)
      setCaret(newCaret);
    const input = val.match(inputLinePat) ?? ["", ""];
    onChange(val, input[1], clean);
  };

  //Called once at startup/load, since empty dependency array.
  useEffect(() => {
    update(initialVal);
  }, []);

  useEffect(() => {
    setCurScrollTop(tapeState.curLine * 18 + 1 - (lineNumbersRef.current?.scrollTop ?? 0));
    setNextScrollTop(tapeState.nextLine * 18 + 1 - (lineNumbersRef.current?.scrollTop ?? 0));
  }, [tapeState]);

  const syncCaret = (e: React.SyntheticEvent<HTMLTextAreaElement>) =>
    setCaret(e.currentTarget.selectionStart);

  const handleScroll = (e: any) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    setCurScrollTop(tapeState.curLine * 18 + 1 - scrollTop);
    setNextScrollTop(tapeState.nextLine * 18 + 1 - scrollTop);

    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
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
      <select className={styles.select} onChange={(e) => update(codeExamples[e.target.value], undefined, true)}>
        {Object.keys(codeExamples).map((opt: string, i: number) => (<option key={i}>{opt}</option>))}
      </select>

      <div className={styles.lineNumbers} ref={lineNumbersRef}>
        {getLineNumbers(code)}
      </div>
      <div className={styles.infoBox}>errors:{errorCount}, row:{cursorRow}, col:{cursorCol}</div>
      {tapeState.curLine >= 0 && <div
        className={styles.lineHighlight}
        style={{
          "--line": `${curScrollTop}px`,
          "--color": "blue",
          "--content": "'prev'",
          "--right-shift": "40px"} as React.CSSProperties}>
      </div>}
      {tapeState.nextLine >= 0 && <div
        className={styles.lineHighlight}
        style={{
          "--line": `${nextScrollTop}px`,
          "--color": "red",
          "--content": "'current'",
          "--right-shift": "80px"} as React.CSSProperties}>
      </div>}

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
        disabled={tapeState.isCodeDisabled}
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
    let [plain, comment] = lines[i].split(commentPat);

    if (plain) {
      if (!inputSet && plain.match(inputLinePat)) {
        plain.split(inputPat).map((str, i) => {
          if (i === 3)
            tokens.push({text: str, token: "input"})
          else
            tokens.push({text: str, token: "plain"})
        });
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
