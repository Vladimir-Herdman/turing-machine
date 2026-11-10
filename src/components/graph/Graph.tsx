import { useRef, useEffect } from 'react';
import { SVG } from '@svgdotjs/svg.js'

import styles from './Graph.module.css'

import { type TapeState } from '../tape/Tape';
import { isEmptyObj } from 'src/utils/objects';

type Props = {
  state: TapeState;
};
export default function Graph({state}: Props) {

  useEffect(() => {
    if (isEmptyObj(state.machineDict))
      return;

    const draw = SVGInit(state);

    return () => {
      draw.remove();
    };
  }, [state]);

  return (
    <div className={styles.graph} id="graph">
    </div>
  );
}

function SVGInit(state: TapeState) {
  var draw = SVG().addTo("#graph").size("100%", "100%");
  draw.viewbox(0, 0, 500, 500);

  draw.rect(200, 100).attr({ fill: '#f06' }).center(250, 250); //x,y
  for (let i=0; i<Object.keys(state.machineDict).length; i++) {
    draw.circle(100).attr({ fill: `#${i}${i}${i}` }).center(200 + 20*i, 250);
  }

  return draw;
}
