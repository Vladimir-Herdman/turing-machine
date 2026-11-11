import { useEffect, useState } from 'react';
import { SVG, type Svg } from '@svgdotjs/svg.js'

import styles from './Graph.module.css'

import { type TapeState } from '../tape/Tape';
import { isEmptyObj } from 'src/utils/objects';
import { haltPat } from 'src/constants/regexPats';


type Props = {
  state: TapeState;
};
export default function Graph({state}: Props) {
  const [copySvgToast, setCopySvgToast] = useState(0);

  const copySvgFunc = async (svg: Svg) => {
    await navigator.clipboard.writeText(svg.svg());
    setCopySvgToast((t) => t + 1);
  };

  useEffect(() => {
    if (copySvgToast === 0) return;
    const id = setTimeout(() => {setCopySvgToast(0)}, 1600);
    return () => clearTimeout(id);
  }, [copySvgToast]);

  useEffect(() => {
    if (isEmptyObj(state.machineDict))
      return;
    const draw = SVGInit(state, copySvgFunc);
    return () => {
      draw.remove();
    };
  }, [state]);

  return (
    <div className={styles.graph} id="graph">
      {copySvgToast !== 0 && (<div key={copySvgToast} className={styles.pToast}>SVG copied to clipboard</div>)}
    </div>
  );
}


type Pos = {
  x: number;
  y: number;
};
function SVGInit(state: TapeState, copyFunc: (svg: Svg) => void) {
  var draw = SVG().addTo("#graph").size("100%", "100%");
  draw.click(async () => { copyFunc(draw) });
  draw.viewbox(0, 0, 1000, 1000);
  draw.rect(1000, 1000).fill("#fff");

  const center = 500;
  const radius = 300;
  const nstates = Object.keys(state.machineDict).length;
  const degree_dif = 360/nstates;

  let states: Record<string, Pos> = {};
  for (let i=0; i<nstates; i++) {
    const x = center + Math.cos((degree_dif*(i*2))/360 * Math.PI) * radius;
    const y = center + Math.sin((degree_dif*(i*2))/360 * Math.PI) * radius;
    const name = Object.keys(state.machineDict)[i];
    states[name] = {x:x, y:y};

    if (name.match(haltPat)) {
      draw.circle(120).attr({ fill: "#000" }).center(x, y);
      draw.circle(110).attr({ fill: "#fff" }).center(x, y);
    }
    draw.circle(100).attr({ fill: "#000" }).center(x, y);
    draw.circle(90).attr({ fill: "#fff" }).center(x, y);

    const text = draw.text(`${name}`).attr({ fill:"#fff" })
      .font({ family:"Times New Roman", size:32 })
      .css({ "mix-blend-mode": "difference" })
      .center(x, y-2);
  }

  return draw;
}
