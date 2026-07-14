import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DoyyW0Xq.js";import{t as i}from"./Icon-Cbr2QWU5.js";import{t as a}from"./camera-CuAWSIRE.js";import{t as o}from"./clipboard-check-jxjNWrPy.js";import{t as s}from"./flag-CzruXygu.js";import{t as c}from"./mail-Ey95ZdMG.js";import{t as l}from"./phone-Cu4NrZF7.js";import{t as u}from"./rotate-ccw-HE2-ZpEW.js";import{t as d}from"./shield-check-C7FDlswJ.js";import{t as ee}from"./timer-CD_UuZKI.js";import{t as te}from"./undo-DlVLJOn1.js";import{b as ne,o as f}from"./index-BwFrdgVW.js";import{t as re}from"./HStack-2WTukjNp.js";import{t as ie}from"./VStack-B8U-hI0Y.js";import{t as p}from"./StackItem-Ca9P7L2I.js";import{n as m,t as h}from"./LayoutContent-CCL91W7X.js";import{t as g}from"./LayoutHeader-Cy2mWoMf.js";import{t as _}from"./Heading-CEfXHtdE.js";import{t as v}from"./Button-DdhUiDLb.js";var y=e(t(),1),b=n(),x=`tpl-waste-route-exception-board`,S=`light-dark(#556B2F, #B8C255)`,C=`light-dark(#FFFFFF, #22270D)`,w=`light-dark(rgba(85, 107, 47, 0.10), rgba(184, 194, 85, 0.14))`,T=`light-dark(#15803D, #4ADE80)`,E=`light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))`,D=`light-dark(#B45309, #FBBF24)`,O=`light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.14))`,k=`light-dark(#DC2626, #F87171)`,A=`light-dark(rgba(220, 38, 38, 0.09), rgba(248, 113, 113, 0.14))`,j=785,M=990,N=6,ae=4;function P(e){let t=Math.floor(e/60)%24,n=e%60;return`${String(t).padStart(2,`0`)}:${String(n).padStart(2,`0`)}`}var F={district:`Barlow Heights · Thursday residential`,date:`Thu Jul 9, 2026`,depot:`Transfer Station 3, Gate B`},I=[{id:`T-41`,route:`R-112`,area:`Kestrel Hills`,driver:`M. Duarte`,stops:82,progress:63,projFinishMin:940},{id:`T-38`,route:`R-108`,area:`Old Mill north`,driver:`J. Okonkwo`,stops:76,progress:76,projFinishMin:761},{id:`T-52`,route:`R-115`,area:`Fairground loop`,driver:`P. Lindqvist`,stops:88,progress:50,projFinishMin:985},{id:`T-19`,route:`R-103`,area:`Cannery flats`,driver:`S. Whitcomb`,stops:71,progress:59,projFinishMin:905},{id:`T-44`,route:`R-119`,area:`Hillside terraces`,driver:`A. Benally`,stops:93,progress:40,projFinishMin:1015},{id:`T-27`,route:`R-121`,area:`Riverbend court`,driver:`L. Fontaine`,stops:64,progress:55,projFinishMin:890}],L=new Map(I.map(e=>[e.id,e])),R=[{id:`E-01`,truckId:`T-41`,stop:34,type:`blocked`,address:`1418 Kestrel Wy`,narrative:`Cart enclosure blocked by a parked silver sedan; driver could not stage the arm. Two photos on file show plate and clearance.`,reportedMin:552,photos:2},{id:`E-02`,truckId:`T-41`,stop:55,type:`notout`,address:`902 Larkspur Ct`,narrative:`Cart not at curb at pass (10:44). Resident called 311 at 10:41 claiming set-out by 06:30; one drive-by photo on file shows empty curb.`,reportedMin:644,photos:1},{id:`E-03`,truckId:`T-52`,stop:12,type:`contamination`,address:`77 Fairground Rd`,narrative:`Recycling cart roughly 40% plastic film plus a garden hose wrapped around the paper load. Left unserviced per contamination policy.`,reportedMin:511,photos:2},{id:`E-04`,truckId:`T-52`,stop:29,type:`overflow`,address:`310 Midway Ave`,narrative:`Lid open past 60° with three extra bags stacked beside the cart. Third overflow at this address this cycle.`,reportedMin:598,photos:1},{id:`E-05`,truckId:`T-52`,stop:41,type:`damaged`,address:`5 Carousel Ln`,narrative:`Cracked lid hinge and a missing rear wheel — cart tips on the lift cycle. Driver skipped the tip to avoid a spill; no photo taken.`,reportedMin:637,photos:0},{id:`E-06`,truckId:`T-19`,stop:22,type:`blocked`,address:`66 Cannery Row W`,narrative:`Construction dumpster from the mill renovation is parked across the alley enclosure. GC contact posted on the fence; photo on file.`,reportedMin:675,photos:1},{id:`E-07`,truckId:`T-44`,stop:18,type:`missed`,address:`2201 Terrace View Dr, Bldg C rear alley (shared)`,narrative:`Route deviation around the Terrace View water-main dig skipped stops 16–19 on the first pass; stop 18 confirmed missed by the resident and the supervisor drive-back.`,reportedMin:740,photos:0}],z=new Map(R.map(e=>[e.id,e])),B={blocked:{label:`Blocked bin`,noticeTemplate:`Access blocked — reschedule card`},notout:{label:`Cart not out`,noticeTemplate:`Cart not out — courtesy card`},contamination:{label:`Contaminated cart`,noticeTemplate:`Contamination — education mailer`},overflow:{label:`Overflowing cart`,noticeTemplate:`Overflow — extra-bag fee notice`},damaged:{label:`Damaged cart`,noticeTemplate:`Damaged cart — replacement order`},missed:{label:`Missed pickup`,noticeTemplate:`Missed pickup — make-up day card`}},V=[{id:`N-01`,address:`445 Alder St`,template:`Cart not out — courtesy card`,filed:`08:12 · T-27`},{id:`N-02`,address:`12 Quarry Rd`,template:`Contamination — education mailer`,filed:`09:05 · T-38`}],H={photo:`Driver photo`,supervisor:`Supervisor verification`,"resident-call":`Resident call log`};function oe(e,t){let n=new Map(t.map(e=>[e.excId,e])),r=new Map;for(let t of R)t.truckId===e.id&&r.set(t.stop,t);let i=[],a=[],o=0,s=0,c=0;for(let t=1;t<=e.stops;t++){let l=r.get(t);if(l!=null){let e=n.get(l.id);e==null?(i.push(`exception`),a.push(l)):e.action===`return`?(i.push(`served`),o++,c++):(i.push(`notice`),s++);continue}t<=e.progress?(i.push(`served`),o++):i.push(`pending`)}let l=o+s,u=e.projFinishMin+c*N,d=l===e.stops&&a.length===0?`complete`:u>M?`pastcutoff`:`onpace`;return{truck:e,stopStates:i,served:o,noticed:s,addressed:l,addressedPct:Math.round(l/e.stops*100),openExceptions:a,finishMin:u,pace:d}}var se={complete:{label:`Complete`,color:T,tint:E},onpace:{label:`On pace`,color:S,tint:w},pastcutoff:{label:`Past 16:30 cutoff`,color:k,tint:A}},ce=`
.${x} {
  height: 100dvh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
  background: var(--color-background-body);
}
.${x} .hc-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.${x} button { font: inherit; color: inherit; }
.${x} :is(button, [role='button'], input):focus-visible {
  outline: 2px solid ${S};
  outline-offset: 2px;
}
/* ---- header ---------------------------------------------------------------- */
.${x} .hc-brandmark {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${w};
  flex-shrink: 0;
}
.${x} .hc-chiprow { display: flex; align-items: center; gap: var(--spacing-2); flex-wrap: wrap; }
.${x} .hc-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-background-body);
}
.${x} .hc-chip[data-tone='brand'] { color: ${S}; background: ${w}; border-color: transparent; }
.${x} .hc-chip[data-tone='ok'] { color: ${T}; background: ${E}; border-color: transparent; }
.${x} .hc-chip[data-tone='notice'] { color: ${D}; background: ${O}; border-color: transparent; }
.${x} .hc-chip[data-tone='exc'] { color: ${k}; background: ${A}; border-color: transparent; }
/* ---- frame: 1fr work column + 400px resolution rail ------------------------ */
.${x} .hc-frame {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
}
.${x} .hc-work {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  border-right: var(--border-width) solid var(--color-border);
}
.${x} .hc-sectionhead {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 36px;
  padding: 6px var(--spacing-4) 0;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
/* ---- route strips: 84px = truck cell 224 + band + stat cell 96 ------------- */
.${x} .hc-strip {
  display: grid;
  grid-template-columns: 224px minmax(0, 1fr) 96px;
  gap: var(--spacing-3);
  align-items: center;
  min-height: 84px;
  padding: 8px var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${x} .hc-truckcell { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.${x} .hc-truckline {
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
}
.${x} .hc-truckid { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.${x} .hc-truckroute { font-size: 12px; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
.${x} .hc-truckarea {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${x} .hc-pacechip {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 0 7px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
/* Tick band: 36px tall; each stop is a flex:1 cell so 64–93 stops always fit. */
.${x} .hc-band {
  display: flex;
  align-items: flex-end;
  gap: 1px;
  height: 36px;
  min-width: 0;
}
.${x} .hc-tick { flex: 1 1 0; min-width: 1px; border-radius: 1px; }
.${x} .hc-tick[data-state='served'] { height: 16px; background: ${S}; opacity: 0.85; }
.${x} .hc-tick[data-state='pending'] { height: 8px; background: var(--color-border); }
.${x} .hc-tick[data-state='notice'] { height: 16px; background: ${D}; }
/* Exception diamonds: real buttons, ~10px wide — compensated by the 40px+
   cards and rail buttons (see the container-policy note in the header). */
.${x} .hc-tickbtn {
  flex: 1.6 1 0;
  min-width: 8px;
  height: 26px;
  padding: 0;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.${x} .hc-tickbtn svg { display: block; }
.${x} .hc-statcell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  white-space: nowrap;
}
.${x} .hc-statpct { font-size: 16px; font-weight: 600; font-variant-numeric: tabular-nums; }
.${x} .hc-statsub { font-size: 11px; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
/* ---- exception cards: wrap grid, min 240px --------------------------------- */
.${x} .hc-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-5);
}
.${x} .hc-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 10px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-body);
  text-align: left;
  cursor: pointer;
  min-height: 40px;
}
.${x} .hc-card[aria-pressed='true'] {
  border-color: ${S};
  background: ${w};
  box-shadow: inset 0 0 0 1px ${S};
}
.${x} .hc-cardtop { display: flex; align-items: center; gap: 8px; min-width: 0; }
.${x} .hc-cardtype { font-size: 13px; font-weight: 600; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.${x} .hc-cardstop { font-size: 11px; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; white-space: nowrap; }
.${x} .hc-cardaddress {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${x} .hc-cardmeta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${x} .hc-emptycards {
  padding: var(--spacing-4);
  margin: var(--spacing-3) var(--spacing-4) var(--spacing-5);
  border: var(--border-width) dashed var(--color-border);
  border-radius: 10px;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
}
/* ---- resolution rail (400px) ------------------------------------------------ */
.${x} .hc-rail {
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}
.${x} .hc-railsection { display: flex; flex-direction: column; gap: var(--spacing-2); }
.${x} .hc-railtitle { font-size: 15px; font-weight: 600; margin: 0; }
.${x} .hc-overline {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${x} .hc-narrative {
  padding: 8px 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}
/* Proof picker: 40px radio rows; the resolve buttons gate on a selection. */
.${x} .hc-proof {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  cursor: pointer;
  font-size: 13px;
}
.${x} .hc-proof[data-checked='true'] {
  border-color: ${S};
  background: ${w};
  box-shadow: inset 0 0 0 1px ${S};
}
.${x} .hc-proof[data-disabled='true'] { opacity: 0.5; cursor: not-allowed; }
.${x} .hc-proof input { position: absolute; opacity: 0; pointer-events: none; }
.${x} .hc-proofmeta { margin-left: auto; font-size: 11px; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; white-space: nowrap; }
.${x} .hc-actions { display: flex; flex-wrap: wrap; gap: var(--spacing-2); }
/* Notice queue + resolution log: 44px rows. */
.${x} .hc-listrow {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: 4px 8px;
  border-radius: 8px;
}
.${x} .hc-listrow + .hc-listrow { margin-top: 2px; }
.${x} .hc-listrow[data-fresh='true'] { background: ${O}; }
.${x} .hc-listbody { min-width: 0; flex: 1; }
.${x} .hc-listprimary {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${x} .hc-listmeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${x} .hc-listtrail { font-size: 11px; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; white-space: nowrap; }
/* ---- responsive subtraction -------------------------------------------------- */
@media (max-width: 980px) {
  .${x} { height: auto; min-height: 100dvh; }
  .${x} .hc-frame { grid-template-columns: minmax(0, 1fr); }
  .${x} .hc-work { border-right: none; overflow-y: visible; }
  .${x} .hc-rail { border-top: var(--border-width) solid var(--color-border); }
}
@media (max-width: 640px) {
  .${x} .hc-strip { grid-template-columns: 120px minmax(0, 1fr) 56px; gap: var(--spacing-2); }
  .${x} .hc-truckarea, .${x} .hc-truckroute { display: none; }
  .${x} .hc-statsub { display: none; }
  .${x} .hc-band { gap: 0; }
  .${x} .hc-cardgrid { grid-template-columns: minmax(0, 1fr); }
  .${x} .hc-actions > * { width: 100%; }
}
`;function le(){return(0,b.jsxs)(`svg`,{width:20,height:20,viewBox:`0 0 20 20`,"aria-hidden":!0,focusable:`false`,children:[(0,b.jsx)(`path`,{d:`M 5 6 h 10 l -1.2 8.5 a 1.6 1.6 0 0 1 -1.6 1.4 h -4.4 a 1.6 1.6 0 0 1 -1.6 -1.4 Z`,fill:S}),(0,b.jsx)(`rect`,{x:4,y:4,width:12,height:2,rx:1,fill:S}),(0,b.jsx)(`rect`,{x:8,y:2.4,width:4,height:2,rx:1,fill:S}),(0,b.jsx)(`path`,{d:`M 7.6 10 l 1.8 1.8 l 3.2 -3.6`,fill:`none`,stroke:C,strokeWidth:1.7,strokeLinecap:`round`,strokeLinejoin:`round`})]})}function U({ghost:e=!1}){return(0,b.jsxs)(`g`,{stroke:`currentColor`,strokeWidth:1.5,fill:`none`,strokeLinecap:`round`,strokeLinejoin:`round`,strokeDasharray:e?`2.4 2.2`:void 0,children:[(0,b.jsx)(`path`,{d:`M 6 7.5 h 10 l -1 9 a 1.5 1.5 0 0 1 -1.5 1.3 h -5 a 1.5 1.5 0 0 1 -1.5 -1.3 Z`}),(0,b.jsx)(`path`,{d:`M 5 7.5 h 12`})]})}function ue({type:e}){return(0,b.jsxs)(`svg`,{width:22,height:22,viewBox:`0 0 22 22`,"aria-hidden":!0,focusable:`false`,style:{flexShrink:0},children:[e===`notout`?(0,b.jsx)(U,{ghost:!0}):(0,b.jsx)(U,{}),e===`blocked`&&(0,b.jsxs)(`g`,{fill:`currentColor`,children:[(0,b.jsx)(`path`,{d:`M 1.5 15.5 q 1.2 -2.6 2.6 -2.6 h 3.4 q 1.4 0 2.2 1.6 l 0.6 1 h -8.8 Z`,opacity:.9}),(0,b.jsx)(`rect`,{x:1,y:15.3,width:10,height:2,rx:1}),(0,b.jsx)(`circle`,{cx:4,cy:18.4,r:1.3}),(0,b.jsx)(`circle`,{cx:9,cy:18.4,r:1.3})]}),e===`notout`&&(0,b.jsx)(`path`,{d:`M 9.2 11 q 1.8 -2.6 3.6 0`,stroke:`currentColor`,strokeWidth:1.4,fill:`none`,strokeLinecap:`round`}),e===`contamination`&&(0,b.jsxs)(`g`,{children:[(0,b.jsx)(`path`,{d:`M 8 7 q 1 -3.4 3 -4.4 q 3 -1.4 3.6 1 q 0.4 1.8 -2.2 2.2`,stroke:`currentColor`,strokeWidth:1.4,fill:`none`,strokeLinecap:`round`}),(0,b.jsx)(`circle`,{cx:11,cy:12.6,r:1.1,fill:`currentColor`}),(0,b.jsx)(`rect`,{x:10.3,y:9,width:1.4,height:2.4,rx:.7,fill:`currentColor`})]}),e===`overflow`&&(0,b.jsxs)(`g`,{children:[(0,b.jsx)(`path`,{d:`M 6 7.5 l 8.6 -3.4`,stroke:`currentColor`,strokeWidth:1.6,strokeLinecap:`round`}),(0,b.jsx)(`circle`,{cx:19,cy:15,r:2.2,fill:`currentColor`,opacity:.85}),(0,b.jsx)(`circle`,{cx:18,cy:18.4,r:1.7,fill:`currentColor`,opacity:.85})]}),e===`damaged`&&(0,b.jsx)(`path`,{d:`M 9 7.5 l 1.6 3.2 l -2.4 1.8 l 2.2 3`,stroke:`currentColor`,strokeWidth:1.5,fill:`none`,strokeLinecap:`round`,strokeLinejoin:`round`}),e===`missed`&&(0,b.jsxs)(`g`,{stroke:`currentColor`,strokeWidth:1.3,fill:`none`,strokeLinecap:`round`,children:[(0,b.jsx)(`circle`,{cx:17,cy:5.4,r:3.4,fill:`var(--color-background-body)`}),(0,b.jsx)(`path`,{d:`M 17 3.6 v 1.9 l 1.4 0.9`})]})]})}function de({selected:e}){return(0,b.jsx)(`svg`,{width:14,height:14,viewBox:`0 0 14 14`,"aria-hidden":!0,focusable:`false`,children:(0,b.jsx)(`rect`,{x:3.2,y:3.2,width:7.6,height:7.6,rx:1.4,transform:`rotate(45 7 7)`,fill:k,stroke:e?`var(--color-text-primary)`:`transparent`,strokeWidth:1.4})})}function W(){let[e,t]=(0,y.useState)([]),[n,S]=(0,y.useState)(`E-01`),[C,w]=(0,y.useState)({}),[T,E]=(0,y.useState)(``),D=(0,y.useMemo)(()=>I.map(t=>oe(t,e)),[e]),O=new Map(D.map(e=>[e.truck.id,e])),A=D.reduce((e,t)=>e+t.truck.stops,0),U=D.reduce((e,t)=>e+t.addressed,0),W=Math.round(U/A*100),G=R.filter(t=>!e.some(e=>e.excId===t.id)).sort((e,t)=>e.reportedMin-t.reportedMin),fe=D.filter(e=>e.pace===`onpace`).length,pe=D.filter(e=>e.pace===`complete`).length,K=D.filter(e=>e.pace===`pastcutoff`).length,q=[...V.map(e=>({...e,fresh:!1})),...e.filter(e=>e.action===`notice`).map(e=>{let t=z.get(e.excId);return{id:`N-${e.excId}`,address:t?.address??`—`,template:t==null?`—`:B[t.type].noticeTemplate,filed:`${P(e.stamp)} · ${t?.truckId??`—`}`,fresh:!0}})],J=z.get(n),Y=e.find(e=>e.excId===n),X=J==null?void 0:O.get(J.truckId),Z=J==null?void 0:C[J.id]??(J.photos>0?`photo`:void 0),Q=e=>{S(e);let t=z.get(e);t!=null&&E(`Selected ${e} — ${B[t.type].label} at ${t.address}, ${t.truckId} stop ${t.stop}.`)},$=e=>{if(J==null||Y!=null||Z==null)return;let n=J,r=Z,i=O.get(n.truckId);t(t=>[...t,{excId:n.id,action:e,proof:r,stamp:j+ae*(t.length+1)}]);let a=G.find(e=>e.id!==n.id);if(a!=null&&S(a.id),i!=null){let t=i.addressed+1,a=Math.round(t/i.truck.stops*100);if(e===`return`){let e=i.finishMin+N;E(`${n.id} resolved — returned and served with ${H[r].toLowerCase()}. ${n.truckId} is now ${a}% addressed, projected finish ${P(e)}${e>M?` — past the 16:30 cutoff`:``}.`)}else E(`${n.id} resolved — notice queued (${B[n.type].noticeTemplate}). ${n.truckId} is now ${a}% addressed.`)}};return(0,b.jsxs)(`div`,{className:x,children:[(0,b.jsx)(`style`,{children:ce}),(0,b.jsx)(`div`,{className:`hc-vh`,"aria-live":`polite`,children:T}),(0,b.jsx)(m,{height:`fill`,header:(0,b.jsx)(g,{hasDivider:!0,children:(0,b.jsxs)(re,{gap:3,vAlign:`center`,wrap:`wrap`,children:[(0,b.jsx)(`span`,{className:`hc-brandmark`,children:(0,b.jsx)(le,{})}),(0,b.jsx)(p,{size:`fill`,children:(0,b.jsxs)(ie,{gap:0,children:[(0,b.jsx)(_,{level:1,children:`Haulcheck · Route Exception Board`}),(0,b.jsxs)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:[F.district,` · `,F.date,` · `,F.depot]})]})}),(0,b.jsxs)(`div`,{className:`hc-chiprow`,children:[(0,b.jsxs)(`span`,{className:`hc-chip`,"data-tone":`brand`,children:[(0,b.jsx)(i,{icon:ee,size:`xsm`,color:`inherit`}),`Board clock `,P(j)]}),(0,b.jsxs)(`span`,{className:`hc-chip`,"data-tone":`brand`,children:[U,`/`,A,` addressed · `,W,`%`]}),(0,b.jsxs)(`span`,{className:`hc-chip`,"data-tone":G.length>0?`exc`:`ok`,children:[(0,b.jsx)(i,{icon:G.length>0?f:ne,size:`xsm`,color:`inherit`}),G.length>0?`${G.length} open exception${G.length===1?``:`s`}`:`Exceptions clear`]}),(0,b.jsxs)(`span`,{className:`hc-chip`,"data-tone":`notice`,children:[(0,b.jsx)(i,{icon:c,size:`xsm`,color:`inherit`}),q.length,` notices queued`]}),(0,b.jsxs)(`span`,{className:`hc-chip`,"data-tone":K>0?`exc`:`ok`,children:[(0,b.jsx)(i,{icon:s,size:`xsm`,color:`inherit`}),fe,` on pace · `,pe,` complete · `,K,` past cutoff`]})]})]})}),content:(0,b.jsx)(h,{padding:0,role:`main`,label:`Route exception board`,children:(0,b.jsxs)(`div`,{className:`hc-frame`,children:[(0,b.jsxs)(`div`,{className:`hc-work`,children:[(0,b.jsxs)(`div`,{className:`hc-sectionhead`,children:[`Route strips · stop ticks · cutoff `,P(M)]}),D.map(e=>{let t=se[e.pace];return(0,b.jsxs)(`div`,{className:`hc-strip`,children:[(0,b.jsxs)(`div`,{className:`hc-truckcell`,children:[(0,b.jsxs)(`span`,{className:`hc-truckline`,children:[(0,b.jsx)(`span`,{className:`hc-truckid`,children:e.truck.id}),(0,b.jsxs)(`span`,{className:`hc-truckroute`,children:[e.truck.route,` · `,e.truck.area]})]}),(0,b.jsx)(`span`,{className:`hc-truckarea`,children:e.truck.driver}),(0,b.jsxs)(`span`,{className:`hc-pacechip`,style:{color:t.color,background:t.tint},children:[t.label,e.pace!==`complete`&&` · ${P(e.finishMin)}`]})]}),(0,b.jsx)(`div`,{className:`hc-band`,role:`group`,"aria-label":`${e.truck.id} stop ticks: ${e.served} served, ${e.noticed} noticed, ${e.openExceptions.length} open exceptions, ${e.truck.stops-e.addressed-e.openExceptions.length} pending of ${e.truck.stops}`,children:e.stopStates.map((t,r)=>{let i=r+1;if(t===`exception`){let t=e.openExceptions.find(e=>e.stop===i);if(t!=null)return(0,b.jsx)(`button`,{type:`button`,className:`hc-tickbtn`,"aria-pressed":t.id===n,"aria-label":`${t.id} — ${B[t.type].label} at stop ${i}, ${t.address}`,onClick:()=>Q(t.id),children:(0,b.jsx)(de,{selected:t.id===n})},i)}return(0,b.jsx)(`span`,{className:`hc-tick`,"data-state":t,"aria-hidden":!0},i)})}),(0,b.jsxs)(`div`,{className:`hc-statcell`,children:[(0,b.jsxs)(`span`,{className:`hc-statpct`,children:[e.addressedPct,`%`]}),(0,b.jsxs)(`span`,{className:`hc-statsub`,children:[e.served,`/`,e.truck.stops,` served`]}),(0,b.jsx)(`span`,{className:`hc-statsub`,children:e.pace===`complete`?`done ${P(e.finishMin)}`:`finish ${P(e.finishMin)}`})]})]},e.truck.id)}),(0,b.jsxs)(`div`,{className:`hc-sectionhead`,children:[`Open exceptions · oldest first · `,G.length]}),G.length===0?(0,b.jsxs)(`div`,{className:`hc-emptycards`,children:[`All exceptions resolved — `,q.length,` notices queued for the Friday mail run. Undo from the resolution log to reopen one.`]}):(0,b.jsx)(`div`,{className:`hc-cardgrid`,children:G.map(e=>(0,b.jsxs)(`button`,{type:`button`,className:`hc-card`,"aria-pressed":e.id===n,onClick:()=>Q(e.id),children:[(0,b.jsxs)(`span`,{className:`hc-cardtop`,children:[(0,b.jsx)(`span`,{style:{color:k,display:`inline-flex`},children:(0,b.jsx)(ue,{type:e.type})}),(0,b.jsx)(`span`,{className:`hc-cardtype`,children:B[e.type].label}),(0,b.jsxs)(`span`,{className:`hc-cardstop`,children:[e.truckId,` · stop `,e.stop]})]}),(0,b.jsx)(`span`,{className:`hc-cardaddress`,children:e.address}),(0,b.jsxs)(`span`,{className:`hc-cardmeta`,children:[(0,b.jsx)(`span`,{children:e.id}),(0,b.jsxs)(`span`,{children:[`reported `,P(e.reportedMin)]}),(0,b.jsxs)(`span`,{style:{display:`inline-flex`,alignItems:`center`,gap:3},children:[(0,b.jsx)(i,{icon:a,size:`xsm`,color:`inherit`}),e.photos]})]})]},e.id))})]}),(0,b.jsxs)(`div`,{className:`hc-rail`,role:`complementary`,"aria-label":`Exception resolution`,children:[J==null?(0,b.jsxs)(`div`,{className:`hc-railsection`,children:[(0,b.jsx)(`h2`,{className:`hc-railtitle`,children:`No exception selected`}),(0,b.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:`Pick a diamond on a route strip or an exception card to triage it.`})]}):(0,b.jsxs)(`div`,{className:`hc-railsection`,children:[(0,b.jsxs)(`span`,{className:`hc-overline`,children:[J.id,` · `,J.truckId,` `,L.get(J.truckId)?.route,` · stop `,J.stop,` `,`of `,L.get(J.truckId)?.stops]}),(0,b.jsxs)(`h2`,{className:`hc-railtitle`,children:[B[J.type].label,` — `,J.address]}),(0,b.jsx)(`div`,{className:`hc-narrative`,children:J.narrative}),(0,b.jsxs)(`div`,{className:`hc-chiprow`,children:[(0,b.jsxs)(`span`,{className:`hc-chip`,children:[`reported `,P(J.reportedMin)]}),(0,b.jsxs)(`span`,{className:`hc-chip`,children:[(0,b.jsx)(i,{icon:a,size:`xsm`,color:`inherit`}),J.photos,` photo`,J.photos===1?``:`s`,` on file`]}),X!=null&&(0,b.jsxs)(`span`,{className:`hc-chip`,"data-tone":X.pace===`pastcutoff`?`exc`:`brand`,children:[J.truckId,` finish `,P(X.finishMin)]})]}),Y==null?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(`span`,{className:`hc-overline`,children:`Proof — required to resolve`}),[[`photo`,a,J.photos===0,J.photos>0?`${J.photos} on file`:`none on file`],[`supervisor`,d,!1,`radio S. Ferro`],[`resident-call`,l,!1,`311 call log`]].map(([e,t,n,r])=>(0,b.jsxs)(`label`,{className:`hc-proof`,"data-checked":Z===e,"data-disabled":n,children:[(0,b.jsx)(`input`,{type:`radio`,name:`hc-proof-${J.id}`,checked:Z===e,disabled:n,onChange:()=>w(t=>({...t,[J.id]:e}))}),(0,b.jsx)(i,{icon:t,size:`sm`,color:`secondary`}),H[e],(0,b.jsx)(`span`,{className:`hc-proofmeta`,children:r})]},e)),(0,b.jsxs)(`div`,{className:`hc-actions`,children:[(0,b.jsx)(v,{label:`Return & serve · +${N} min`,icon:(0,b.jsx)(i,{icon:u,size:`sm`}),isDisabled:Z==null,onClick:()=>$(`return`)}),(0,b.jsx)(v,{label:`Leave notice · ${B[J.type].noticeTemplate.split(` — `)[1]??`card`}`,variant:`secondary`,icon:(0,b.jsx)(i,{icon:c,size:`sm`}),isDisabled:Z==null,onClick:()=>$(`notice`)})]}),Z==null&&(0,b.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:`Select a proof source to enable resolution — no photo is on file for this exception.`})]}):(0,b.jsxs)(`div`,{className:`hc-narrative`,children:[`Resolved at `,P(Y.stamp),` —`,` `,Y.action===`return`?`returned & served`:`notice queued`,` `,`with `,H[Y.proof].toLowerCase(),`. Undo from the resolution log to reopen.`]})]}),(0,b.jsxs)(`div`,{className:`hc-railsection`,children:[(0,b.jsx)(`span`,{className:`hc-overline`,children:`Resident notice queue · mails Fri Jul 10`}),q.map(e=>(0,b.jsxs)(`div`,{className:`hc-listrow`,"data-fresh":e.fresh,children:[(0,b.jsx)(i,{icon:c,size:`sm`,color:`secondary`}),(0,b.jsxs)(`div`,{className:`hc-listbody`,children:[(0,b.jsx)(`div`,{className:`hc-listprimary`,children:e.template}),(0,b.jsx)(`div`,{className:`hc-listmeta`,children:e.address})]}),(0,b.jsx)(`span`,{className:`hc-listtrail`,children:e.filed})]},e.id))]}),(0,b.jsxs)(`div`,{className:`hc-railsection`,children:[(0,b.jsx)(`span`,{className:`hc-overline`,children:`Resolution log · this session`}),e.length===0?(0,b.jsxs)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:[`Nothing resolved yet. Resolutions stamp `,P(j),` + 4 min each and land here with their proof source.`]}):(0,b.jsxs)(b.Fragment,{children:[e.map(e=>{let t=z.get(e.excId);return(0,b.jsxs)(`div`,{className:`hc-listrow`,children:[(0,b.jsx)(i,{icon:o,size:`sm`,color:`secondary`}),(0,b.jsxs)(`div`,{className:`hc-listbody`,children:[(0,b.jsxs)(`div`,{className:`hc-listprimary`,children:[e.excId,` ·`,` `,e.action===`return`?`Returned & served`:`Notice queued`]}),(0,b.jsxs)(`div`,{className:`hc-listmeta`,children:[t?.address,` · proof: `,H[e.proof]]})]}),(0,b.jsx)(`span`,{className:`hc-listtrail`,children:P(e.stamp)})]},e.excId)}),(0,b.jsx)(`div`,{className:`hc-actions`,children:(0,b.jsx)(v,{label:`Undo last resolution`,variant:`ghost`,icon:(0,b.jsx)(i,{icon:te,size:`sm`}),onClick:()=>{let n=e[e.length-1];n!=null&&(t(e=>e.slice(0,-1)),S(n.excId),E(`Resolution of ${n.excId} undone — exception reopened.`))}})})]})]})]})]})})})]})}export{W as default};