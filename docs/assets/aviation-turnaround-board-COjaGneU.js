import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DgVzIcJL.js";import{t as i}from"./Icon-Bv9dUoit.js";import{t as a}from"./clock-3-Unh8BfDF.js";import{t as o}from"./flag-JgaiD5t2.js";import{t as s}from"./fuel-Du1HMkPQ.js";import{t as c}from"./luggage-CIFfaUf0.js";import{t as l}from"./rotate-ccw-DLPUmPRU.js";import{t as u}from"./sparkles-C_P-lbcO.js";import{t as d}from"./timer-CuSZYRQs.js";import{t as f}from"./utensils-Bm-FUhuL.js";import{A as p,b as m,o as h}from"./index-784iMtOZ.js";import{t as g}from"./Tooltip-XDRm9Z-w.js";import{t as _}from"./HStack-2WTukjNp.js";import{t as v}from"./VStack-B8U-hI0Y.js";import{t as y}from"./StackItem-Ca9P7L2I.js";import{n as b,t as x}from"./LayoutContent-CCL91W7X.js";import{t as S}from"./LayoutHeader-Cy2mWoMf.js";import{t as C}from"./Heading-DAgevMWr.js";import{t as w}from"./Badge-0Tj9omHc.js";import{t as T}from"./Button-CPJJaCfy.js";var E=p(`plane-landing`,[[`path`,{d:`M2 22h20`,key:`272qi7`}],[`path`,{d:`M3.77 10.77 2 9l2-4.5 1.1.55c.55.28.9.84.9 1.45s.35 1.17.9 1.45L8 8.5l3-6 1.05.53a2 2 0 0 1 1.09 1.52l.72 5.4a2 2 0 0 0 1.09 1.52l4.4 2.2c.42.22.78.55 1.01.96l.6 1.03c.49.88-.06 1.98-1.06 2.1l-1.18.15c-.47.06-.95-.02-1.37-.24L4.29 11.15a2 2 0 0 1-.52-.38Z`,key:`1ma21e`}]]),D=e(t(),1),O=n(),k=`tpl-aviation-turnaround-board`,A=`light-dark(#B45309, #F5A623)`,j=`light-dark(#FFFFFF, #231A08)`,M=`light-dark(rgba(180, 83, 9, 0.12), rgba(245, 166, 35, 0.16))`,N=`light-dark(#15803D, #4ADE80)`,P=`light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))`,F=`light-dark(#DC2626, #F87171)`,I=`light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.14))`,L=0,R=140,z=6,B=(R-L)*z,V=72,H=4;function U(e){let t=16+Math.floor(e/60),n=e%60;return`${t}:${n<10?`0`:``}${n}`}function W(e){return e===0?`0m`:e>0?`+${e}m`:`−${Math.abs(e)}m`}var G=[`fuel`,`bags`,`catering`,`cabin`],K={fuel:{label:`Fuel uplift`,icon:s,lane:0},bags:{label:`Bags unload + load`,icon:c,lane:1},catering:{label:`Catering exchange`,icon:f,lane:2},cabin:{label:`Cabin service`,icon:u,lane:3}},q=[{kind:`departed`,id:`b2`,stand:`B2`,inbound:`NG 145 · PDX`,outbound:`NG 208 · SAN`,route:`San Diego Intl`,tail:`N481NG`,type:`A320neo`,body:`narrow`,onBlocks:4,sobt:55,offBlock:52,tasks:[{id:`fuel`,sched:12,dur:18,progress:{kind:`done`,start:12,end:30},note:`AvGold truck 4 · 11,900 lb uplift complete.`},{id:`bags`,sched:8,dur:30,progress:{kind:`done`,start:8,end:38},note:`96 bags off / 88 on · belt 2 crew of 4.`},{id:`catering`,sched:10,dur:16,progress:{kind:`done`,start:10,end:26},note:`SkyGalley cart swap, fwd + aft galleys.`},{id:`cabin`,sched:14,dur:20,progress:{kind:`done`,start:14,end:34},note:`Turn clean, 5-crew sweep.`}]},{kind:`active`,id:`b3`,stand:`B3`,inbound:`NG 517 · SEA`,outbound:`NG 214 · AUS`,route:`Austin–Bergstrom Intl`,tail:`N8703J`,type:`B737-8`,body:`narrow`,onBlocks:38,sobt:95,tasks:[{id:`fuel`,sched:50,dur:24,progress:{kind:`active`,started:62},note:`AvGold truck 7 held at B5 heavy — started 12 min late. 14,600 lb planned.`},{id:`bags`,sched:42,dur:40,progress:{kind:`active`,started:42},note:`124 bags off / 131 on · transfer cart for AUS bank staged.`},{id:`catering`,sched:46,dur:20,progress:{kind:`done`,start:46,end:66},note:`SkyGalley done 17:06 — aft galley sealed.`},{id:`cabin`,sched:66,dur:18,deps:[`catering`],progress:{kind:`active`,started:66},note:`Crew of 4 aboard; waits on catering carts clearing the aft door.`}]},{kind:`active`,id:`b4`,stand:`B4`,inbound:`CQ 3305 · BOI`,outbound:`CQ 3412 · OKC`,route:`Will Rogers World`,tail:`N612CQ`,type:`E175`,body:`narrow`,onBlocks:58,sobt:90,tasks:[{id:`fuel`,sched:64,dur:14,progress:{kind:`active`,started:64},note:`AvGold truck 2 · 7,100 lb — short uplift, tabs only.`},{id:`bags`,sched:62,dur:22,progress:{kind:`active`,started:62},note:`58 bags off / 61 on · single belt, crew of 3.`},{id:`cabin`,sched:66,dur:12,progress:{kind:`active`,started:66},note:`Quick-turn tidy — seat pockets and lavs only.`}]},{kind:`active`,id:`b5`,stand:`B5`,inbound:`NG 770 · HNL`,outbound:`NG 771 · HNL`,route:`Honolulu — Daniel K. Inouye International`,tail:`N771NG`,type:`B767-300`,body:`wide`,onBlocks:10,sobt:110,tasks:[{id:`fuel`,sched:30,dur:45,progress:{kind:`active`,started:30},note:`AvGold truck 7 · 84,300 lb transpac uplift, dual-point.`},{id:`bags`,sched:16,dur:58,progress:{kind:`active`,started:16},note:`212 bags + 9 AKE cans · two belts, crew of 6.`},{id:`catering`,sched:20,dur:50,progress:{kind:`done`,start:20,end:68},note:`Double cart exchange finished 17:08, 2 min early.`},{id:`cabin`,sched:70,dur:24,deps:[`catering`],progress:{kind:`pending`},note:`Deep-clean crew of 8 staged at the jet bridge.`}]},{kind:`active`,id:`b6`,stand:`B6`,inbound:`NG 433 · ORD (arr +22)`,outbound:`NG 590 · MSY`,route:`Louis Armstrong New Orleans Intl`,tail:`N321NG`,type:`A321`,body:`narrow`,onBlocks:62,sobt:100,tasks:[{id:`fuel`,sched:70,dur:22,progress:{kind:`active`,started:70},note:`AvGold truck 5 · 16,900 lb — normal pace.`},{id:`bags`,sched:66,dur:34,progress:{kind:`active`,started:66},note:`141 bags off / 138 on · compressed after the late arrival.`},{id:`catering`,sched:68,dur:18,progress:{kind:`active`,started:68},note:`SkyGalley single exchange — aft door blocked until carts clear.`},{id:`cabin`,sched:84,dur:16,deps:[`catering`],progress:{kind:`pending`},note:`Crew of 5 waiting on the aft galley — the recoverable link in the chain.`}]},{kind:`inbound`,id:`b7`,stand:`B7`,inbound:`CQ 3286 · GEG`,outbound:`CQ 3287 · TUS`,route:`Tucson Intl`,tail:`N644CQ`,type:`E175`,body:`narrow`,onBlocks:85,sobt:122,tasks:[{id:`fuel`,sched:91,dur:13,progress:{kind:`pending`},note:`AvGold truck 2 rolls from B4 after the CQ 3412 push.`},{id:`bags`,sched:89,dur:20,progress:{kind:`pending`},note:`49 bags expected off / 55 on.`},{id:`catering`,sched:90,dur:12,progress:{kind:`pending`},note:`Snack-cart top-up only.`},{id:`cabin`,sched:93,dur:12,progress:{kind:`pending`},note:`Quick-turn tidy.`}]},{kind:`open`,id:`b8`,stand:`B8`,note:`Open · next arrival NG 902 · SLC at 18:40 (outside this window)`}];function J(e){return e>0?`late`:-e<5?`tight`:`ontime`}function Y(e,t){if(e.kind===`open`)return{turn:e,tasks:[],offBlock:0,delta:0,risk:`ontime`};if(e.kind===`departed`){let t=e.tasks.map(e=>({task:e,start:e.progress.kind===`done`?e.progress.start:e.sched,end:e.progress.kind===`done`?e.progress.end:e.sched+e.dur,status:`done`,slip:0,isCritical:!1,isOverrun:!1})),n=e.offBlock-e.sobt;return{turn:e,tasks:t,offBlock:e.offBlock,delta:n,risk:J(n)}}let n=new Map,r=e.tasks.map(r=>{let i=t[`${e.id}.${r.id}`]??{slip:0},a,o,s,c=!1;if(r.progress.kind===`done`)a=r.progress.start,o=r.progress.end,s=`done`;else if(r.progress.kind===`active`)a=r.progress.started,i.completedAt===void 0?(o=Math.max(a+r.dur+i.slip,V),s=`active`,c=o>a+r.dur):(o=i.completedAt,s=`done`);else{let t=(r.deps??[]).reduce((e,t)=>Math.max(e,n.get(t)??0),0);a=Math.max(r.sched,t,V),e.kind===`inbound`&&(a=Math.max(a,r.sched)),o=a+r.dur+i.slip,s=`pending`}return n.set(r.id,o),{task:r,start:a,end:o,status:s,slip:i.slip,isCritical:!1,isOverrun:c}}),i=r.reduce((e,t)=>Math.max(e,t.end),0);for(let e of r)if(e.end===i){e.isCritical=!0;break}let a=i+H,o=a-e.sobt;return{turn:e,tasks:r,offBlock:a,delta:o,risk:J(o)}}function X(e){let t=0,n=0,r=0,i=0,a=0;for(let o of e)o.turn.kind!==`open`&&(t+=1,o.delta<=0?(n+=1,o.risk===`tight`&&o.turn.kind!==`departed`&&(i+=1)):(r+=1,a+=o.delta));return{turns:t,onTime:n,late:r,tight:i,lateMinutes:a}}var Z=`
.${k} {
  font-family: var(--font-family-sans);
}
.${k} button {
  font: inherit;
  color: inherit;
}
.${k} .atb-focusable:focus-visible {
  outline: 2px solid ${A};
  outline-offset: 2px;
}
.${k} .atb-header-row {
  padding: var(--spacing-2) var(--spacing-4);
  min-height: 56px;
  box-sizing: border-box;
}
.${k} .atb-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: ${A};
}
.${k} .atb-content {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* --- stat strip: 44px of derived chips ---------------------------------- */
.${k} .atb-stats {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 44px;
  box-sizing: border-box;
  padding: var(--spacing-1) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  overflow-x: auto;
}
.${k} .atb-stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-background-surface);
  white-space: nowrap;
}
.${k} .atb-stat strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.${k} .atb-stat--late {
  border-color: ${F};
  color: ${F};
  background: ${I};
}
.${k} .atb-stat--late strong { color: ${F}; }
.${k} .atb-stat--tight {
  border-color: ${A};
  color: ${A};
  background: ${M};
}
.${k} .atb-stat--tight strong { color: ${A}; }
.${k} .atb-stat--ok {
  border-color: ${N};
  color: ${N};
  background: ${P};
}
.${k} .atb-stat--ok strong { color: ${N}; }
/* --- board scroller ------------------------------------------------------ */
.${k} .atb-board {
  flex: 1;
  min-height: 0;
  overflow: auto;
  position: relative;
}
.${k} .atb-grid {
  display: grid;
  grid-template-columns: 232px ${B}px;
  width: max-content;
}
/* Axis row: 32px, sticky top. Corner cell sticky both axes. */
.${k} .atb-corner {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 6;
  height: 32px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-3);
  background: var(--color-background-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  border-right: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${k} .atb-axis {
  position: sticky;
  top: 0;
  z-index: 5;
  height: 32px;
  box-sizing: border-box;
  background: var(--color-background-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  position: sticky;
}
.${k} .atb-axis-inner {
  position: relative;
  width: ${B}px;
  height: 100%;
}
.${k} .atb-tick {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  transform: translateX(-50%);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${k} .atb-now-chip {
  position: absolute;
  top: 4px;
  transform: translateX(-50%);
  padding: 1px 8px;
  border-radius: 999px;
  background: ${A};
  color: ${j};
  font-size: 10.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  white-space: nowrap;
  z-index: 1;
}
/* Stand column cells: sticky left, 116px rows. */
.${k} .atb-stand {
  position: sticky;
  left: 0;
  z-index: 4;
  height: 116px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 8px var(--spacing-3);
  background: var(--color-background-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  border-right: var(--border-width) solid var(--color-border);
  overflow: hidden;
}
.${k} .atb-stand-top {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.${k} .atb-stand-code {
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.${k} .atb-plane {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--color-text-secondary);
}
.${k} .atb-flightline {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
}
.${k} .atb-flightline .atb-route {
  font-weight: 400;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.${k} .atb-tailline {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 22px risk chip — text keeps its own ≥4.5:1 pair on the wash. */
.${k} .atb-risk {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  height: 22px;
  box-sizing: border-box;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--color-text-secondary);
  background: var(--color-background-body);
}
.${k} .atb-risk--ontime { color: ${N}; border-color: ${N}; background: ${P}; }
.${k} .atb-risk--tight { color: ${A}; border-color: ${A}; background: ${M}; }
.${k} .atb-risk--late { color: ${F}; border-color: ${F}; background: ${I}; }
/* Timeline cells */
.${k} .atb-lanecell {
  position: relative;
  height: 116px;
  box-sizing: border-box;
  border-bottom: var(--border-width) solid var(--color-border);
  background:
    repeating-linear-gradient(
      to right,
      var(--color-border) 0,
      var(--color-border) 1px,
      transparent 1px,
      transparent ${20*z}px
    );
  background-color: var(--color-background-body);
}
.${k} .atb-lanecell--departed { opacity: 0.55; }
.${k} .atb-stand--departed > :not(.atb-risk) { opacity: 0.55; }
.${k} .atb-nowline {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-1px);
  background: ${A};
  opacity: 0.85;
  pointer-events: none;
}
.${k} .atb-openrow {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 var(--spacing-4);
  font-size: 12px;
  color: var(--color-text-secondary);
}
/* Segments: 22px-tall real buttons on 26px lane pitch (8px row padding). */
.${k} .atb-seg {
  position: absolute;
  height: 22px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 6px;
  border-radius: 5px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  transition: opacity 120ms ease, color 120ms ease;
}
.${k} .atb-seg--done {
  border-color: ${N};
  color: ${N};
  background: ${P};
}
.${k} .atb-seg--active {
  border-color: ${A};
  color: ${A};
  /* elapsed portion painted via --atb-pct set inline per segment */
  background: linear-gradient(
    to right,
    ${M} var(--atb-pct, 0%),
    var(--color-background-surface) var(--atb-pct, 0%)
  );
}
.${k} .atb-seg--pending {
  border-style: dashed;
  color: var(--color-text-secondary);
  background: var(--color-background-body);
}
.${k} .atb-seg--overrun,
.${k} .atb-seg--latecrit {
  border-color: ${F};
  color: ${F};
}
.${k} .atb-seg--selected {
  box-shadow: 0 0 0 2px var(--color-accent);
}
.${k} .atb-seg-label {
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.${k} .atb-seg-flag {
  display: inline-flex;
  flex-shrink: 0;
}
.${k} .atb-lane-empty {
  position: absolute;
  height: 22px;
  display: flex;
  align-items: center;
  font-size: 10.5px;
  color: var(--color-text-secondary);
  opacity: 0.8;
  white-space: nowrap;
}
/* --- detail bar ----------------------------------------------------------- */
.${k} .atb-detail {
  flex-shrink: 0;
  min-height: 108px;
  box-sizing: border-box;
  border-top: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  padding: var(--spacing-2) var(--spacing-4);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-2) var(--spacing-5);
}
.${k} .atb-detail-main {
  min-width: 260px;
  flex: 1 1 320px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.${k} .atb-detail-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 700;
  min-width: 0;
}
.${k} .atb-detail-title .atb-detail-flight {
  font-weight: 600;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${k} .atb-detail-note {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.${k} .atb-detail-times {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${k} .atb-detail-times strong {
  color: var(--color-text-primary);
  font-weight: 600;
}
.${k} .atb-detail-driver { color: ${F}; font-weight: 600; }
.${k} .atb-detail-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-2);
}
/* Density-grid contract: the detail bar's mutation buttons are the 40px
   touch path that compensates for the 22px segments. */
.${k} .atb-detail-actions button {
  min-height: 40px;
}
.${k} .atb-detail-hint {
  font-size: 12.5px;
  color: var(--color-text-secondary);
}
.${k} .atb-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* --- responsive subtraction ------------------------------------------------ */
@media (max-width: 900px) {
  .${k} .atb-grid { grid-template-columns: 148px ${B}px; }
  .${k} .atb-flightline .atb-route { display: none; }
  .${k} .atb-tailline { display: none; }
}
@media (max-width: 600px) {
  .${k} .atb-grid { grid-template-columns: 116px ${B}px; }
  .${k} .atb-flightline { display: none; }
  .${k} .atb-plane { display: none; }
  .${k} .atb-detail { padding-bottom: var(--spacing-3); }
}
@media (prefers-reduced-motion: reduce) {
  .${k} .atb-seg { transition: none; }
}
`;function Q({size:e=22}){return(0,O.jsx)(`span`,{className:`atb-mark`,"aria-hidden":`true`,children:(0,O.jsxs)(`svg`,{width:e,height:e,viewBox:`0 0 22 22`,fill:`none`,children:[(0,O.jsx)(`rect`,{x:`2`,y:`4`,width:`18`,height:`2.6`,rx:`1.3`,fill:`currentColor`}),(0,O.jsx)(`rect`,{x:`2`,y:`8.4`,width:`18`,height:`2.6`,rx:`1.3`,fill:`currentColor`}),(0,O.jsx)(`rect`,{x:`2`,y:`13`,width:`4.4`,height:`2.6`,rx:`1.3`,fill:`currentColor`}),(0,O.jsx)(`rect`,{x:`8.8`,y:`13`,width:`4.4`,height:`2.6`,rx:`1.3`,fill:`currentColor`}),(0,O.jsx)(`rect`,{x:`15.6`,y:`13`,width:`4.4`,height:`2.6`,rx:`1.3`,fill:`currentColor`}),(0,O.jsx)(`rect`,{x:`2`,y:`17.4`,width:`4.4`,height:`2.6`,rx:`1.3`,fill:`currentColor`}),(0,O.jsx)(`rect`,{x:`8.8`,y:`17.4`,width:`4.4`,height:`2.6`,rx:`1.3`,fill:`currentColor`}),(0,O.jsx)(`rect`,{x:`15.6`,y:`17.4`,width:`4.4`,height:`2.6`,rx:`1.3`,fill:`currentColor`})]})})}function $({body:e}){let t=e===`wide`?21:18;return(0,O.jsx)(`span`,{className:`atb-plane`,"aria-hidden":`true`,children:(0,O.jsx)(`svg`,{width:t,height:t,viewBox:`0 0 20 20`,fill:`currentColor`,children:(0,O.jsx)(`path`,{d:`M9.2 1.6c.3-.9 1.3-.9 1.6 0l.7 2.2c.1.4.2.9.2 1.3v2.6l6.7 3.6c.4.2.6.6.6 1v1.1c0 .3-.3.5-.6.4l-6.7-1.9v3.4l1.9 1.5c.2.2.4.5.4.8v.9c0 .3-.3.5-.6.4l-3.4-.9-3.4.9c-.3.1-.6-.1-.6-.4v-.9c0-.3.1-.6.4-.8l1.9-1.5v-3.4l-6.7 1.9c-.3.1-.6-.1-.6-.4v-1.1c0-.4.2-.8.6-1l6.7-3.6V5.1c0-.4.1-.9.2-1.3l.7-2.2Z`})})})}var ee=[0,20,40,60,80,100,120,140];function te(){let[e,t]=(0,D.useState)({}),[n,o]=(0,D.useState)({turnId:`b3`,taskId:`fuel`}),[s,c]=(0,D.useState)(``),u=(0,D.useMemo)(()=>q.map(t=>Y(t,e)),[e]),f=(0,D.useMemo)(()=>X(u),[u]),p=f.turns===0?0:Math.round(f.onTime/f.turns*100),A=n===null?void 0:u.find(e=>e.turn.id===n.turnId),j=A!==void 0&&n!==null?A.tasks.find(e=>e.task.id===n.taskId):void 0,M=(e,n,r)=>{t(r);let i=q.find(t=>t.id===e);if(i===void 0||i.kind===`open`||i.kind===`departed`)return;let a=Y(i,r),o=X(q.map(e=>Y(e,r))),s=Math.round(o.onTime/o.turns*100),l=a.delta>0?`${a.delta} min late`:a.risk===`tight`?`tight, ${-a.delta}-min margin`:`on time, ${-a.delta}-min margin`;c(`${n} ${i.outbound} now projects off-block ${U(a.offBlock)} — ${l}. OTP ${o.onTime} of ${o.turns} (${s}%).`)},N=(t,n)=>{let r=`${t}.${n}`,i={...e,[r]:{...e[r]??{slip:0},completedAt:V}};M(t,`${K[n].label} completed at ${U(V)}.`,i)},P=(t,n,r)=>{let i=`${t}.${n}`,a=e[i]??{slip:0},o={...e,[i]:{...a,slip:a.slip+r}};M(t,`${K[n].label} slipped +${r} min.`,o)},F=(t,n)=>{let r=`${t}.${n}`,i={...e};delete i[r],M(t,`${K[n].label} reset to plan.`,i)},I=(0,O.jsx)(S,{children:(0,O.jsx)(`div`,{className:`atb-header-row`,children:(0,O.jsxs)(_,{gap:3,vAlign:`center`,wrap:`wrap`,children:[(0,O.jsx)(Q,{}),(0,O.jsx)(y,{size:`fill`,style:{minWidth:0},children:(0,O.jsxs)(v,{gap:0,children:[(0,O.jsxs)(_,{gap:2,vAlign:`center`,wrap:`wrap`,children:[(0,O.jsx)(C,{level:2,children:`Tarmac · Turnaround Board`}),(0,O.jsx)(w,{label:`Concourse B`,variant:`neutral`})]}),(0,O.jsx)(r,{type:`supporting`,color:`secondary`,children:`Meridian International · Wed Jul 8, 2026 · ops window 16:00–18:20 · ramp controller D. Ibarra`})]})}),(0,O.jsxs)(`span`,{className:`atb-stat ${f.late>0?`atb-stat--late`:`atb-stat--ok`}`,role:`status`,"aria-label":`On-time performance ${f.onTime} of ${f.turns} turns, ${p} percent`,children:[(0,O.jsx)(i,{icon:a,size:`xsm`,color:`inherit`}),`OTP `,(0,O.jsxs)(`strong`,{children:[f.onTime,`/`,f.turns]}),` · `,p,`%`]})]})})}),R=(0,O.jsxs)(`div`,{className:`atb-stats`,role:`group`,"aria-label":`Derived window statistics`,children:[(0,O.jsxs)(`span`,{className:`atb-stat`,children:[`Turns in window `,(0,O.jsx)(`strong`,{children:f.turns})]}),(0,O.jsxs)(`span`,{className:`atb-stat ${f.late>0?`atb-stat--late`:`atb-stat--ok`}`,children:[f.late>0?(0,O.jsx)(i,{icon:h,size:`xsm`,color:`inherit`}):(0,O.jsx)(i,{icon:m,size:`xsm`,color:`inherit`}),(0,O.jsx)(`strong`,{children:f.late}),` late`]}),(0,O.jsxs)(`span`,{className:`atb-stat ${f.tight>0?`atb-stat--tight`:``}`,children:[(0,O.jsx)(i,{icon:d,size:`xsm`,color:`inherit`}),(0,O.jsx)(`strong`,{children:f.tight}),` tight (<5m margin)`]}),(0,O.jsxs)(`span`,{className:`atb-stat ${f.lateMinutes>0?`atb-stat--late`:`atb-stat--ok`}`,children:[`Projected late minutes `,(0,O.jsx)(`strong`,{children:f.lateMinutes})]}),(0,O.jsxs)(`span`,{className:`atb-stat`,children:[(0,O.jsx)(i,{icon:E,size:`xsm`,color:`inherit`}),`Now `,(0,O.jsx)(`strong`,{children:U(V)})]})]}),B=(0,O.jsx)(`div`,{className:`atb-board`,role:`group`,"aria-label":`Turnaround Gantt, stands B2 to B8`,children:(0,O.jsxs)(`div`,{className:`atb-grid`,children:[(0,O.jsx)(`div`,{className:`atb-corner`,children:`Stand / Turn`}),(0,O.jsx)(`div`,{className:`atb-axis`,"aria-hidden":`true`,children:(0,O.jsxs)(`div`,{className:`atb-axis-inner`,children:[ee.map(e=>(0,O.jsx)(`span`,{className:`atb-tick`,style:{left:(e-L)*z},children:U(e)},e)),(0,O.jsxs)(`span`,{className:`atb-now-chip`,style:{left:(V-L)*z},children:[`NOW `,U(V)]})]})}),u.map(e=>{let{turn:t}=e;return t.kind===`open`?(0,O.jsx)(ne,{stand:t.stand,note:t.note},t.id):(0,O.jsx)(re,{derived:e,riskLabel:t.kind===`departed`?e.delta<=0?`Departed ${U(t.offBlock)} · on time`:`Departed ${U(t.offBlock)} · ${W(e.delta)}`:e.delta>0?`${W(e.delta)} late · proj ${U(e.offBlock)}`:e.risk===`tight`?`Tight · ${-e.delta}m margin`:`On time · ${-e.delta}m margin`,selection:n,onSelect:e=>o({turnId:t.id,taskId:e})},t.id)})]})}),H;if(A===void 0||j===void 0||A.turn.kind===`open`)H=(0,O.jsx)(`div`,{className:`atb-detail`,children:(0,O.jsx)(`span`,{className:`atb-detail-hint`,children:`Select a task segment on the board to see its schedule, dependency note, and the Complete / Slip controls.`})});else{let t=A.turn,n=K[j.task.id],a=t.kind===`departed`,o=t.kind===`inbound`,s=!a&&j.status===`active`,c=!a&&j.status!==`done`,u=e[`${t.id}.${j.task.id}`]!==void 0,d=A.tasks.find(e=>e.isCritical);H=(0,O.jsxs)(`div`,{className:`atb-detail`,children:[(0,O.jsxs)(`div`,{className:`atb-detail-main`,children:[(0,O.jsxs)(`span`,{className:`atb-detail-title`,children:[(0,O.jsx)(i,{icon:n.icon,size:`sm`,color:`inherit`}),n.label,(0,O.jsxs)(`span`,{className:`atb-detail-flight`,children:[t.outbound,` · stand `,t.stand,` · `,t.tail]})]}),(0,O.jsx)(`span`,{className:`atb-detail-note`,children:j.task.note}),(0,O.jsxs)(`div`,{className:`atb-detail-times`,children:[(0,O.jsxs)(`span`,{children:[`Sched `,(0,O.jsxs)(`strong`,{children:[U(j.task.sched),`–`,U(j.task.sched+j.task.dur)]})]}),(0,O.jsxs)(`span`,{children:[j.status===`done`?`Actual`:`Projected`,` `,(0,O.jsxs)(`strong`,{children:[U(j.start),`–`,U(j.end)]}),j.slip>0?` (slip +${j.slip}m)`:``]}),(0,O.jsxs)(`span`,{children:[`SOBT `,(0,O.jsx)(`strong`,{children:U(t.sobt)}),` · proj off-block`,` `,(0,O.jsx)(`strong`,{children:U(A.offBlock)}),` `,A.delta>0?(0,O.jsxs)(`span`,{className:`atb-detail-driver`,children:[W(A.delta),` late`]}):`(${-A.delta}m margin)`]}),d!==void 0&&(0,O.jsxs)(`span`,{children:[`Driver:`,` `,(0,O.jsxs)(`strong`,{children:[K[d.task.id].label,` ends `,U(d.end)]}),` `,`→ off-block `,U(A.offBlock)]})]})]}),(0,O.jsx)(`div`,{className:`atb-detail-actions`,children:a?(0,O.jsxs)(r,{type:`supporting`,color:`secondary`,children:[`Turn closed — departed `,U(t.offBlock),`.`]}):(0,O.jsxs)(O.Fragment,{children:[s?(0,O.jsx)(T,{label:`Complete now (${U(V)})`,variant:`primary`,size:`sm`,icon:(0,O.jsx)(i,{icon:m,size:`sm`,color:`inherit`}),onClick:()=>N(t.id,j.task.id)}):(0,O.jsx)(g,{content:j.status===`done`?`Already complete`:o?`Aircraft not on stand — ETA ${U(t.onBlocks)}`:`Not started — begins ${U(j.start)}`,children:(0,O.jsx)(`span`,{children:(0,O.jsx)(T,{label:`Complete now (${U(V)})`,variant:`primary`,size:`sm`,isDisabled:!0,icon:(0,O.jsx)(i,{icon:m,size:`sm`,color:`inherit`})})})}),(0,O.jsx)(T,{label:`Slip +5m`,variant:`secondary`,size:`sm`,isDisabled:!c,onClick:()=>P(t.id,j.task.id,5)}),(0,O.jsx)(T,{label:`Slip +15m`,variant:`secondary`,size:`sm`,isDisabled:!c,onClick:()=>P(t.id,j.task.id,15)}),(0,O.jsx)(T,{label:`Reset to plan`,variant:`ghost`,size:`sm`,isDisabled:!u,icon:(0,O.jsx)(i,{icon:l,size:`sm`,color:`inherit`}),onClick:()=>F(t.id,j.task.id)})]})})]})}return(0,O.jsxs)(`div`,{className:k,style:{height:`100dvh`,width:`100%`},children:[(0,O.jsx)(`style`,{children:Z}),(0,O.jsx)(b,{height:`fill`,header:I,content:(0,O.jsx)(x,{padding:0,children:(0,O.jsxs)(`div`,{className:`atb-content`,children:[(0,O.jsx)(`div`,{"aria-live":`polite`,className:`atb-vh`,children:s}),R,B,H]})})})]})}function ne({stand:e,note:t}){return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsxs)(`div`,{className:`atb-stand`,children:[(0,O.jsx)(`div`,{className:`atb-stand-top`,children:(0,O.jsx)(`span`,{className:`atb-stand-code`,children:e})}),(0,O.jsx)(`span`,{className:`atb-risk`,children:`Open`})]}),(0,O.jsxs)(`div`,{className:`atb-lanecell`,children:[(0,O.jsx)(`div`,{className:`atb-nowline`,style:{left:(V-L)*z}}),(0,O.jsx)(`div`,{className:`atb-openrow`,children:t})]})]})}function re({derived:e,riskLabel:t,selection:n,onSelect:r}){let a=e.turn;if(a.kind===`open`)return null;let o=a.kind===`departed`,s=new Set(e.tasks.map(e=>e.task.id));return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsxs)(`div`,{className:`atb-stand${o?` atb-stand--departed`:``}`,children:[(0,O.jsxs)(`div`,{className:`atb-stand-top`,children:[(0,O.jsx)(`span`,{className:`atb-stand-code`,children:a.stand}),(0,O.jsx)($,{body:a.body}),(0,O.jsxs)(`span`,{className:`atb-flightline`,children:[a.outbound,(0,O.jsx)(`span`,{className:`atb-route`,children:a.route})]})]}),(0,O.jsxs)(`span`,{className:`atb-tailline`,children:[a.tail,` · `,a.type,` · in `,a.inbound,` ·`,` `,a.kind===`inbound`?`ETA ${U(a.onBlocks)}`:`on blocks ${U(a.onBlocks)}`,` `,`· SOBT `,U(a.sobt)]}),(0,O.jsxs)(`span`,{className:`atb-risk atb-risk--${e.risk===`late`?`late`:o||e.risk===`ontime`?`ontime`:`tight`}`,children:[e.risk===`late`?(0,O.jsx)(i,{icon:h,size:`xsm`,color:`inherit`}):(0,O.jsx)(i,{icon:m,size:`xsm`,color:`inherit`}),t]})]}),(0,O.jsxs)(`div`,{className:`atb-lanecell${o?` atb-lanecell--departed`:``}`,children:[(0,O.jsx)(`div`,{className:`atb-nowline`,style:{left:(V-L)*z}}),e.tasks.map(t=>(0,O.jsx)(ie,{turnId:a.id,flight:a.outbound,derivedTask:t,isSelected:n!==null&&n.turnId===a.id&&n.taskId===t.task.id,isTurnLate:e.delta>0,onSelect:r},t.task.id)),G.filter(e=>!s.has(e)).map(e=>(0,O.jsxs)(`span`,{className:`atb-lane-empty`,style:{top:8+K[e].lane*26,left:442},children:[`No `,e,` this turn — quick-turn profile`]},e))]})]})}function ie({turnId:e,flight:t,derivedTask:n,isSelected:r,isTurnLate:a,onSelect:s}){let{task:c,start:l,end:u,status:d,isCritical:f,isOverrun:p}=n,m=K[c.id],h=(l-L)*z,_=Math.max((u-l)*z,16),v=d===`active`?Math.round(Math.min(Math.max((V-l)/(u-l),0),1)*100):0,y=_>=96;return(0,O.jsxs)(`button`,{type:`button`,className:`atb-seg atb-focusable ${d===`done`?`atb-seg--done`:d===`active`?`atb-seg--active`:`atb-seg--pending`}${p?` atb-seg--overrun`:f&&a?` atb-seg--latecrit`:``}${r?` atb-seg--selected`:``}`,style:{left:h,width:_,top:8+m.lane*26,"--atb-pct":`${v}%`},"aria-pressed":r,"aria-label":`${m.label}, ${t}: ${d}, ${U(l)} to ${U(u)}${f?`, pushback driver`:``}`,onClick:()=>s(c.id),children:[(0,O.jsx)(i,{icon:m.icon,size:`xsm`,color:`inherit`}),y&&(0,O.jsxs)(`span`,{className:`atb-seg-label`,children:[m.label,` `,U(l),`–`,U(u)]}),f&&(0,O.jsx)(g,{content:`Pushback driver — this task's end sets the off-block time`,children:(0,O.jsx)(`span`,{className:`atb-seg-flag`,children:(0,O.jsx)(i,{icon:o,size:`xsm`,color:`inherit`})})})]})}export{te as default};