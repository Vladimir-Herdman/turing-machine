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
  const [draw, center, radius, nstates] = setupSvgDrawing(state, copyFunc);
  const degree_dif = 360/nstates;

  let statePos: Record<string, Pos> = {};
  for (let i=0; i<nstates; i++) {
    const x = center + Math.round(Math.cos((degree_dif*(i*2))/360 * Math.PI) * radius);
    const y = center + Math.round(Math.sin((degree_dif*(i*2))/360 * Math.PI) * radius);
    const name = Object.keys(state.machineDict)[i];
    statePos[name] = {x, y};
  }

  drawArrows(draw, statePos, state);
  for (let i=0; i<nstates; i++) {
    const name = Object.keys(statePos)[i];
    const {x, y} = statePos[name];
    drawStateCircle(draw, name, x, y);
  }

  return draw;
}

function setupSvgDrawing(state: TapeState, copyFunc: (svg: Svg) => void): [draw: Svg, center: number, radius: number, nstates: number] {
  var draw = SVG().addTo("#graph").size("100%", "100%");
  draw.click(async () => { copyFunc(draw) });
  draw.viewbox(0, 0, 1000, 1000);
  draw.rect(1000, 1000).fill("#fff");

  const center = 500;
  const radius = 300;
  const nstates = Object.keys(state.machineDict).length;

  return [draw, center, radius, nstates]
}

type StateInfo = {
  name: string;
  pos: Pos;
  to: StateInfo[];
}
function drawArrows(draw: Svg, statePos: Record<string, Pos>, state: TapeState) {
  //build data structure of states and states they point to.
  let stateInfo: StateInfo[] = getStateInfo(statePos, state);

  //draw arrows from each state to its to states.
  stateInfo.forEach(({name:fname, pos:from, to:fto}) => {
    fto.forEach(({name:tname, pos:to, to:tto}) => {
      if (fname === tname) //points back to self.
        return;

      if (tto.length > 0) //points back to fname.
        console.log();

      to = shortenByRadius(from, to, tname.match(haltPat) ? 70 : 60);
      let curvePoint = {x:(from.x + to.x)/2, y:(from.y + to.y)/2};
      if (statesPointAtEachOther(stateInfo, fname, tname))
        curvePoint = getCurvePoint(from, to, 125);

      const p = draw.path(`M ${from.x} ${from.y} Q ${curvePoint.x} ${curvePoint.y}, ${to.x} ${to.y}`)
        .fill("none")
        .stroke({ color:"#000", width:4 })
        .marker("end", 8, 8, (add) => {
          add.path("M 0 0 L 8 4 L 0 8").fill("none").stroke({ color:"#000", width:1 });
        });
    });
  });
}

function getStateInfo(statePos: Record<string, Pos>, state: TapeState): StateInfo[] {
  let stateInfo: StateInfo[] = [];
  Object.keys(statePos).forEach((sname) => {
    const transitions = state.machineDict[sname];

    let toStates: StateInfo[] = []
    //other states that sname points to.
    Object.entries(transitions).filter(([, tval]) => tval.newState !== sname).forEach(([tinput, tval]) => {
      if (tinput === " ")
        tinput = "_";

      //This fixes an issue I had for a while: in palindrome, q7 is pointed to,
      //but not formally declared with steps in the program. I decided it should
      //still be drawn, since arrows will point to it, even if it points nowhere.
      if (tval.newState === "v")
        return;

      const otherPointBacks = Object.values(state.machineDict[tval.newState]).filter(smd => smd.newState === sname);
      let backTo = [];
      if (otherPointBacks.length > 0)
        backTo.push({} as StateInfo);

      toStates.push({
        name:tval.newState,
        pos:statePos[tval.newState],

        //include only if it points back at this state.
        to:backTo,
      });
    });

    //if sname points back to itself.
    Object.entries(transitions).filter(([, tval]) => tval.newState === sname).forEach(([tinput, tval]) => {
      if (tinput === " ")
        tinput = "_";

      toStates.push({
        name:tval.newState,
        pos:statePos[tval.newState],
        to:[],
      });
    });

    stateInfo.push({
      name:sname,
      pos:statePos[sname],
      to:toStates,
    });
  });

  return stateInfo;
}

function getCurvePoint(from: Pos, to: Pos, offset: number) {
  const [dx, dy] = [to.x - from.x, to.y - from.y];
  const len = Math.hypot(dx, dy) || 1;

  const [perpx, perpy] = [(-(to.y - from.y))/len, (to.x - from.x)/len];
  const [mx, my] = [(to.x + from.x)/2, (to.y + from.y)/2];

  return {
    x:mx + perpx * offset,
    y:my + perpy * offset,
  };
}

function statesPointAtEachOther(stateInfo: StateInfo[], s1: string, s2: string): boolean {
  return true;
}

//arrows point to center of state circle, so shorten some so the arrow head is
//visible instead of covered.
function shortenByRadius(from: Pos, to: Pos, radius: number): Pos {
  const [dx, dy] = [to.x - from.x, to.y - from.y];
  const length = Math.hypot(dx, dy);
  return {
    x: Math.round(to.x - (dx / length)*radius),
    y: Math.round(to.y - (dy / length)*radius)
  };
}

function drawStateCircle(draw: Svg, name: string, x: number, y: number) {
  if (name.match(haltPat)) {
    draw.circle(120).attr({ fill: "#000" }).center(x, y);
    draw.circle(110).attr({ fill: "#fff" }).center(x, y);
  }
  draw.circle(100).attr({ fill: "#000" }).center(x, y);
  draw.circle(90).attr({ fill: "#fff" }).center(x, y);

  draw.text(`${name}`).attr({ fill:"#fff" })
    .font({ family:"Times New Roman", size:32 })
    .css({ "mix-blend-mode": "difference" })
    .center(x, y-2);
}
